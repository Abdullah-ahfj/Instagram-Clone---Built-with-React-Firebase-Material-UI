import React, {useEffect, useState} from 'react';
import './App.css';
import './css/imageUpload.css';
import Post from './components/Post';
import {db, auth} from "./database/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile } from "firebase/auth";
import ImageUpload from './components/ImageUpload';
import { InstagramEmbed } from 'react-social-media-embed';



const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function App() {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(null);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  //authenticating and updating userLogin
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        console.log("User logged in:", authUser);
        setUserLoggedIn(authUser);


      } else {
        // User logged out
        setUserLoggedIn(null);
      }
    });
  
    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, [userLoggedIn, user.username]);
  
  
  // fetching posts from firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "posts"), (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()})));
    });
  
    return () => unsubscribe(); 
  }, []);


  // handle signup form
  const handleSubmitSignUp = async (e) => {
    e.preventDefault();
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const authUser = userCredential.user;
  
      await updateProfile(authUser, {
        displayName: user.username,
      });
      
      setOpen(false);
      console.log("User signed up:", authUser);
    } catch (error) {
      alert(error.message);
      console.error("Error signing up:", error.message);
    }
  };

  // handle signin form 
  const handleSubmitSignIn = async (e) => {
    e.preventDefault();
  
    try {
      await signInWithEmailAndPassword(auth, user.email, user.password);
      setOpenSignIn(false); // Close modal on success
    } catch (error) {
      alert(error.message); // Handle error
    }
  };

  //handle signup form's inputs
  const handleSignUpInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  }


  return (
    <div className="app">

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <center>
            <img
              src='https://png.monster/wp-content/uploads/2020/11/Instagram-Logo-1f59e501.png'
              className='app_modalImage'
              alt='logo'
            />
            <form onSubmit={handleSubmitSignUp} className='app_signup'>
              <Input 
                type='text'
                name='username'
                placeholder='Username'
                value={user.username}
                onChange={handleSignUpInput}
              />
              <Input 
                type="email"
                name='email'
                placeholder='Email'
                value={user.email}
                onChange={handleSignUpInput}
              />
              <Input 
                type="password"
                name='password'
                placeholder='Password'
                value={user.password}
                onChange={handleSignUpInput}
              />
              <Button type='submit' >SIGN UP</Button>
            </form> 
          </center>
        </Box>
      </Modal>

      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <center>
            <img
              src='https://png.monster/wp-content/uploads/2020/11/Instagram-Logo-1f59e501.png'
              className='app_modalImage'
              alt='logo'
            />
            <form onSubmit={handleSubmitSignIn} className='app_signup'>
              <Input 
                type="email"
                name='email'
                placeholder='Email'
                value={user.email}
                onChange={handleSignUpInput}
              />
              <Input 
                type="password"
                name='password'
                placeholder='Password'
                value={user.password}
                onChange={handleSignUpInput}
              />
              <Button type='submit' >SIGN IN</Button>
            </form> 
          </center>
        </Box>
      </Modal>

          {/* header */}
      <div className='app_header'>
          <img 
          className='app_headerImage'
          src="https://lindseypublicover.wordpress.com/wp-content/uploads/2014/08/instagram-logo.png" 
          alt='logo'
          />   
          {userLoggedIn ?
            <Button onClick={() => auth.signOut()}>LOGOUT</Button> 
            : 
            <div className='app_loginContainer'>
              <Button onClick={() => setOpen(true)}>SIGN UP</Button>
              <Button onClick={() => setOpenSignIn(true)}>SIGN IN</Button>
            </div>
          }
      </div>

        {/* posts */}
      <div className='app_posts'>
        <div className='app_postsLeft'>
          {posts.map((post) => {
            return <Post  key={post.id} user={userLoggedIn} postId={post.id} username={post.username} caption={post.caption} imageUrl={post.imageUrl} />
          })}
        </div>
        <div className='app_postsRight'>
            <InstagramEmbed url="https://www.instagram.com/p/CUbHfhpswxt/" width={328} captioned />
        </div>

      </div>



      {userLoggedIn?.displayName?
        <ImageUpload username={userLoggedIn.displayName} />
        :
        <h3>Sorry you need to login to upload </h3>
      }
    
    </div>
  );
}

export default App;
