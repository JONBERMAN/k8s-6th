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


// 설정: 이미지 저장 경로 및 파일명 중복 방지
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, "/ocrImage");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only .jpg, .jpeg, and .png files are allowed!"));
  },
});


// Handles POST request to /post.    가게부 직접 등록
//router.post('/registerAB', (req, res) => {
router.post("/registerAB", upload.single("receipt"), (req, res) => {
  console.log(`received request: ${req.method} ${req.url}`)

  // validate request
  const userId = req.session.userId
  const { expense, money, date } = req.body;
  const receiptPath = req.file ? req.file.path : null;


  if (!userId) {
    res.send("<script>alert('로그인 후 이용가능합니다.');location.href='/login';</script>");
    return;
  }

  if (!expense || expense.length == 0) {
    res.status(400).send("expense is not specified");
    return;
  }

  if (!money || money.length == 0 || isNaN(money)) {
    res.status(400).send("money is not specified or is not a valid number");
    return;
  }

  if (!date || date.length == 0) {
    res.status(400).send("Date is not specified")
    return
  }


  // 이미지가 업로드된 경우 OCR API 호출
  if (receiptPath) {
    console.log(`Processing OCR for receipt: ${receiptPath}`);
    axios
      .post(ocrUri, {
        userId,
        expense,
        receiptDirectory: receiptPath,
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
    axios
      .post(registerABUri, {
        userId: userId,
        expense: expense,
        money: money,
        date: date,
      })
      .then((response) => {
        console.log(`Response from registerABUri` + response.status);
        res.redirect("/");
      })
      .catch((error) => {
        console.error("Error: " + error);
        res.status(500).send("Internal Server Error");
      });

  }



});

