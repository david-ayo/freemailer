const {parsed} = require('dotenv').config()
const express = require('express')
const multer = require('multer');
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer')
var compression = require('compression');
const handlebars = require('handlebars')
const helmet = require('helmet');
const fs = require('fs')
const path = require('path')
const sendGridTransport = require('nodemailer-sendgrid-transport')
// const {SENDGRID_API} = require('./config/keys')

const app = express()

app.use(express.json())

// middleware that only parses json and only looks at requests where the Content-Type header matches the type option
app.use(bodyParser.json());

app.use(helmet());

app.use(compression())


// declared origins from which the server will accept requests
//let allowedOrigins = parsed.ORIGINS.split(' ')

// app.use(
//     cors({
//         origin: function (origin, callback) {
//             // allow requests with no origin
//             // (like mobile apps or curl requests)
//             if (!origin) return callback(null, true);
//             if (allowedOrigins.indexOf(origin) === -1) {
//                 let msg =
//                     "The CORS policy for this site does not " +
//                     "allow access from the specified Origin.";
//                 return callback(new Error(msg), false);
//             }
//             return callback(null, true);
//         }
//     })
// )

// app.use(function (req, res, next) {
//     let origin = req.headers.origin;
//     if (allowedOrigins.includes(origin)) {
//         res.header("Access-Control-Allow-Origin", origin); // restrict it to the required domain
//     }

//     res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     next();
// });

const PORT = process.env.PORT // || parsed.PORT

// the folder on the server to which the files are to be uploaded
const UPLOAD_FILES_DIR = "./uploads";

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, UPLOAD_FILES_DIR)
    },

    // By default, multer removes file extensions, this adds them back
    filename: function(req, file, cb) {
        const {originalname: originalName} = file;
        // if you want to get the name of the file w/o the extension
        let ogName = originalName.split('.')[0]
        cb(null,  `${ogName}-${Date.now()}${path.extname(file.originalname)}` );
    }
});

// a method we'll use to parse the incoming multipart FormData
const upload = multer({storage}).array("file", 10)


const filePath = path.join(__dirname, './emailTemp/index.html');
const source = fs.readFileSync(filePath, 'utf-8').toString();
const template = handlebars.compile(source);

let transport = nodemailer.createTransport({
    host: process.env.HOST, // || parsed.HOST,
    port: process.env.MAIL_PORT,
    protocol: 'smtp',
    auth: {
       user: process.env.USER, // || parsed.USER,
       pass: process.env.PASS // || parsed.PASS
    }
});

function sendMail (req, res, imagesLinks) {
    const { agent, email, user } = req.body
    
    const replacements = {
        agent,
        user
    };
    // console.log(req.body, imagesLinks)
    const htmlToSend = template(replacements);

    transport.sendMail({
        to: email,
        from: 'no-reply@3lineng.com',
        subject:"Agent File Upload",
        html:htmlToSend,
        attachments: imagesLinks
    }).then(resp => {
        res.json(Object.assign({},resp, {respCode: "00", respDescription: "The email was sent successfully"}))
        // res.status(200).send({respDescription: "The email was sent successfully"});
    })
    // .then(()=>(
    //   imagesLinks.map(link => (
    //     fs.unlink(link.content, function(err) {
    //       if (err) {
    //         throw err
    //       } else {
    //         console.log("Successfully deleted "+link.filename)
    //       }
    //     })
    //   ))
    // ))
    .catch(err => {
        console.log(err)
        res.status(300).send({respCode: "96", respDescription: "The email failed to send"});
    })

}

app.post('/api/send', (req, res) => {
    
    let imagePath = "abc";
    let postId = req.params.postId;
    let imagesLinks = [];
    // console.log(req.body)
    try {
    
        upload(req, res, (err) => {
          if (err) {
            console.log(err);
          } else {
            if (req.files == undefined) {
              console.log("File not found.");
            } else {
              //image uploaded successfully
    
              req.files.map(function (file) {
                imagePath = "./uploads/" + file.filename;
                imagesLinks.push({filename:file.filename, path:imagePath});
              });
            }
          }
        //   res.status(201).send(imagesLinks);
        sendMail(req, res, imagesLinks)
        });
      }finally{
        console.log("process completed")
      }

})

app.listen(PORT,()=>{
    console.log("server is running on",PORT)
})
