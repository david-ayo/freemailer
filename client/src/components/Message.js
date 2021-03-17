import React,{useState} from 'react'
import axios from 'axios';

const Message  = ()=>{
    const [agent,setName] = useState("")
    const [email,setEmail] = useState("")
    const [message,setMessage] = useState(null)
    const [subject,setSubject] = useState("")
    const [file,setFile] = useState(null)

    const PostData = ()=>{
        let formData = new FormData()
                formData.append(
                    'file',
                    file,
                    file.name
                )
                formData.append(
                    'file',
                    message,
                    message.name
                )
                formData.append(
                    'agent',
                    agent
                )
                formData.append(
                    'email',
                    email
                )
        axios({
            method: "POST",
            url: "api/send",
            data: formData,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
            .then(response => {
                    if (response.status === 200) {
                        console.log("Success, KYC updated")
                        alert(response.respDescription)
                        setMessage('')
                        setName('')
                        setSubject('')
                        setEmail('')
                        setFile('')
                    } else {
                        console.log("Error occurred")
                    }
                }
            ).catch(e => {
            console.log(e)
        })
    }
   return (
      <div style={{maxWidth: '60%', display:'flex', flexDirection: 'column', alignItems:'center'}} className="mycard">
          <div className="card auth-card input-field">
            <h2>Send me a Message</h2>
            <input
            type="text"
            placeholder="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            />
            <input
            type="text"
            placeholder="agent"
            value={agent}
            onChange={(e)=>setName(e.target.value)}
            />
            <input
            type="file"
            name="file"
            onChange={(e)=>setFile(e.target.files[0])}
            />
            <input
            type="file"
            name="file"
            onChange={(e)=>setMessage(e.target.files[0])}
            />
            <button className="btn waves-effect waves-light #64b5f6 blue darken-1"
            onClick={()=>PostData()}
            >
                Send Message
            </button>
        </div>
      </div>
   )
}


export default Message