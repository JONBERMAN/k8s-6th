const express = require('express')
const path = require('path');
const app = express();
const bodyParser = require('body-parser')
const axios = require('axios')
const session = require('express-session');
const multer = require("multer");
const fs = require("fs");

const util = require('./utils')

//const GUESTBOOK_API_ADDR = process.env.GUESTBOOK_API_ADDR
const GUESTBOOK_API_ADDR = "192.168.56.100:8080";

const BACKEND_URI = `http://${GUESTBOOK_API_ADDR}/k8s`

const signupUri = "http://192.168.56.100:8080/k8s/user/signup";
const signinUri = "http://192.168.56.100:8080/k8s/user/signin";
const getUserNameUri = "http://192.168.56.100:8080/k8s/user/:userId";
const getABUri = "http://192.168.56.100:8080/k8s/accountbook/:userId";
const ocrUri = "http://192.168.56.100:8080/k8s/accountbook/ocr";
const registerABUri = "http://192.168.56.100:8080/k8s/accountbook";

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
const PORT = 3001;
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



// // Ensure the /ocrImage directory exists
// const uploadDir = path.join(__dirname, "/ocrImage");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // Set up Multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir); // Save to /ocrImage directory
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({ storage: storage });



// // Handle POST request with file upload
// router.post("/registerAB", upload.single("receipt"), (req, res) => {
//   const { expense, money, date } = req.body;
//   const userId = req.session.userId;

//   if (!userId) {
//     res.status(401).send("<script>alert('로그인 후 이용 가능합니다.');location.href='/login';</script>");
//     return;
//   }

//   if (!expense || !money || !date) {
//     res.status(400).send("모든 필드를 입력해주세요.");
//     return;
//   }

//   // Check if a receipt was uploaded
//   let receiptDirectory = null;
//   if (req.file) {
//     receiptDirectory = `/ocrImage/${req.file.filename}`;
//     console.log(`receiptDirectory:`, receiptDirectory);
//   }

//   console.log(`Registering AB with data:`, { userId, expense, money, date, receiptDirectory });

//   axios
//     .post(registerABUri, {
//       userId,
//       expense,
//       money,
//       date,
//       receiptDirectory,
//     })
//     .then((response) => {
//       console.log(`Response from registerABUri:`, response.status);
//       res.redirect("/");
//     })
//     .catch((error) => {
//       console.error("Error:", error.message);
//       res.status(500).send("Internal Server Error");
//     });
// });



// 설정: 파일 업로드 디렉터리
// const upload = multer({ dest: 'uploads/' });

// 설정: 파일 저장 디렉터리와 파일 이름 지정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '/ocrImage');
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
  const receiptDirectory = req.file ? path.join('ocrImage', req.file.filename) : null; // 업로드된 파일 경로

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



















/**************************************************************************** */



// 설정: 이미지 저장 경로 및 파일명 중복 방지
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       const dir = path.join(__dirname, "/ocrImage");
//       if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir);
//       }
//       cb(null, dir);
//     },
//     filename: (req, file, cb) => {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null, `${uniqueSuffix}-${file.originalname}`);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(new Error("Only .jpg, .jpeg, and .png files are allowed!"));
//   },

// });


// Handles POST request to /post.    가게부 직접 등록
//router.post('/registerAB', (req, res) => {
// router.post("/registerAB", upload.single("receipt"), (req, res) => {
//   console.log(`received request: ${req.method} ${req.url}`)

//   // validate request
//   const userId = req.session.userId
//   const { expense, money, date } = req.body;
//   const receiptPath = req.file ? req.file.path : null;


//   if (!userId) {
//     res.send("<script>alert('로그인 후 이용가능합니다.');location.href='/login';</script>");
//     return;
//   }

//   if (!expense || expense.length == 0) {
//     res.status(400).send("expense is not specified");
//     return;
//   }

//   if (!money || money.length == 0 || isNaN(money)) {
//     res.status(400).send("money is not specified or is not a valid number");
//     return;
//   }

//   if (!date || date.length == 0) {
//     res.status(400).send("Date is not specified")
//     return
//   }


//   // 이미지가 업로드된 경우 OCR API 호출
//   if (receiptPath) {
//     console.log(`Processing OCR for receipt: ${receiptPath}`);
//     axios
//       .post(ocrUri, {
//         userId,
//         expense,
//         receiptDirectory: receiptPath,
//       })
//       .then((response) => {
//         console.log("OCR API Response:", response.data);
//         res.redirect("/");
//       })
//       .catch((error) => {
//         console.error("OCR API Error:", error.message);
//         res.status(500).send("Failed to process OCR");
//       });
//   } else {
//     axios
//       .post(registerABUri, {
//         userId: userId,
//         expense: expense,
//         money: money,
//         date: date,
//         receiptDirectory: receiptDirectory
//       })
//       .then((response) => {
//         console.log(`Response from registerABUri` + response.status);
//         res.redirect("/");
//       })
//       .catch((error) => {
//         console.error("Error: " + error);
//         res.status(500).send("Internal Server Error");
//       });

//   }



// });

