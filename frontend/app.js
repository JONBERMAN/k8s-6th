const express = require('express')
const path = require('path');
const app = express();
const bodyParser = require('body-parser')
const axios = require('axios')
const session = require('express-session');
const multer = require("multer");
const fs = require("fs");

const util = require('./utils')

const ACCOUNTBOOK_API_ADDR = process.env.ACCOUNTBOOK_API_ADDR
//const ACCOUNTBOOK_API_ADDR = "192.168.56.100:8080";

const BACKEND_URI = `http://${ACCOUNTBOOK_API_ADDR}:8080/k8s`


const signupUri = `${BACKEND_URI}/user/signup`
const signinUri = `${BACKEND_URI}/user/signin`;
const getUserNameUri = `${BACKEND_URI}/user/:userId`;
const getABUri = `${BACKEND_URI}/accountbook/:userId`;
const ocrUri = `${BACKEND_URI}/accountbook/ocr`;
const registerABUri = `${BACKEND_URI}/accountbook`;

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))

// 세션 설정
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

const router = express.Router()
app.use(router)

app.use(express.static('public'))
router.use(bodyParser.urlencoded({ extended: false }))




// Application will fail if environment variables are not set
// if (!process.env.PORT) {
//   const errMsg = "PORT environment variable is not defined"
//   console.error(errMsg)
//   throw new Error(errMsg)
// }

// if (!process.env.GUESTBOOK_API_ADDR) {
//   const errMsg = "GUESTBOOK_API_ADDR environment variable is not defined"
//   console.error(errMsg)
//   throw new Error(errMsg)
// }

// Starts an http server on the $PORT environment variable
//const PORT = process.env.PORT;
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

// Handles GET request to /
// router.get("/", (req, res) => {
//     // retrieve list of messages from the backend, and use them to render the HTML template
//     axios
//       .get(getABUri)
//       .then((response) => {
//         console.log(`response from getABUri: ` + response.status);
//         const result = util.formatMessages(response.data);
//         res.render("home", { messages: result });
//       })
//       .catch((error) => {
//         console.error("error: " + error);
//       });
// });

// Home page
router.get("/", (req, res) => {
  const { userId } = req.session;
  console.log("req.session.userId:", req.session);
  
  console.log("ACCOUNTBOOK_API_ADDR:", ACCOUNTBOOK_API_ADDR);

  if (!userId) {
    res.render("home", { userData: null });
  } else {
    axios
      .get(`${getABUri.replace(":userId", userId)}`)
      .then((response) => {
        const userData = response.data.resultData || [];
        console.log("userData: ", userData);
        const userName = req.session.userName;
        res.render("home", { userData, userName });
      })
      .catch((error) => {
        console.error("Error fetching user data:", error.message);
        res.render("home", { userData: [] });
      });
  }
});

// Signup page
router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", (req, res) => {
  const { id, password, name } = req.body;

  if (!id || !password || !name) {
    res.status(400).send("All fields are required");
    return;
  }

  axios.post(signupUri, { id, password, name })
    .then(response => {
      console.log("Signup successful");
      res.redirect("/");
    })
    .catch(error => {
      console.error("Signup error:", error.message);
      res.status(500).send("Signup failed");
    });
});

// Login page
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    res.status(400).send("ID and Password are required");
    return;
  }

  axios.post(signinUri, { id, password })
    .then(response => {
      const { userId, name } = response.data.resultData;

      if (userId < 0) {
        res.send("<script>alert('사용자 정보가 없습습니다.');location.href='/';</script>");
      }
      else {
        req.session.userId = userId; // 세션에 userId 저장
        req.session.userName = name; // 유저 이름 저장
        console.log(`Login successful: UserId=${userId}, Name=${name}`);
        res.redirect("/");
      }
    })
    .catch(error => {
      console.error("Login error:", error.message);
      res.status(401).send("Invalid credentials");
    });
});

// Logout route
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});



// 설정: 파일 업로드 디렉터리
// const upload = multer({ dest: 'uploads/' });

// 설정: 파일 저장 디렉터리와 파일 이름 지정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadDir = path.join( '/ocrImage');
      if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir); // 업로드 디렉터리가 없으면 생성
      }
      cb(null, uploadDir); // 저장 경로 설정
  },
  filename: (req, file, cb) => {
      const ext = path.extname(file.originalname); // 파일의 확장자 추출
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      cb(null, uniqueName); // 랜덤 파일 이름 생성
  }
});

// multer 설정
const upload = multer({ storage });



// 새로운 엔드포인트: 파일 업로드 및 OCR API 호출
router.post('/upload-receipt', upload.single('receipt'), async (req, res) => {
    try {
        const filePath = path.join('/ocrImage', req.file.filename);

        // OCR API 호출
        const ocrResponse = await axios.post(ocrUri, {
            userId: req.session.userId ,
            expense: "test",
            receiptDirectory: filePath
        });

        //const amount = ocrResponse.data.amount; // API 응답에서 금액 추출
        const amount = 1234;

        res.json({ success: true, amount });
    } catch (error) {
        console.error('OCR Error:', error);
        res.json({ success: false, message: 'OCR 인식 실패' });
    }
});



// 엔드포인트 정의
router.post('/registerAB', upload.single('receipt'), (req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);

  const userId = req.session.userId; // 세션에서 사용자 ID 가져오기
  const { expense, money, date } = req.body; // 폼 데이터 추출
  const receiptDirectory = req.file ? path.join('/ocrImage', req.file.filename) : null; // 업로드된 파일 경로

  // 입력값 검증
  if (!userId) {
      res.send("<script>alert('로그인 후 이용가능합니다.');location.href='/login';</script>");
      return;
  }

  if (!expense || expense.length === 0) {
      res.status(400).send("Expense is not specified");
      return;
  }

  if (!money || money.length === 0 || isNaN(money)) {
      res.status(400).send("Money is not specified or is not a valid number");
      return;
  }

  if (!date || date.length === 0) {
      res.status(400).send("Date is not specified");
      return;
  }

  // 이미지가 업로드된 경우 OCR API 호출
  if (receiptDirectory) {
      console.log(`Processing OCR for receipt: ${receiptDirectory}`);
      axios
          .post(ocrUri, {
              userId,
              expense,
              receiptDirectory, // OCR API에 파일 경로 전달
          })
          .then((response) => {
              console.log("OCR API Response:", response.data);
              res.redirect("/");
          })
          .catch((error) => {
              console.error("OCR API Error:", error.message);
              res.status(500).send("Failed to process OCR");
          });
  } else {
      // 이미지 없이 데이터만 저장
      axios
          .post(registerABUri, {
              userId,
              expense,
              money,
              date,
              receiptDirectory: null, // 파일이 없을 경우 null 전달
          })
          .then((response) => {
              console.log(`Response from registerABUri: ${response.status}`);
              res.redirect("/");
          })
          .catch((error) => {
              console.error("Error:", error.message);
              res.status(500).send("Internal Server Error");
          });
  }
});

