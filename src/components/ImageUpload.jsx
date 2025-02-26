import React, { useState } from 'react';
import "../css/imageUpload.css"
import Button from '@mui/material/Button';
import { storage, db } from '../database/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function ImageUpload({ username }) {
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState('');
    
    const handleChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        
        const storageRef = ref(storage, `images/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on('state_changed',
            (snapshot) => {
                //progress function
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setProgress(progress);
            },
            //error function
            (error) => {
                console.log(error);
                alert(error.message);
            },
            //complete function (async)
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    await addDoc(collection(db, 'posts'), {
                        timestamp: serverTimestamp(),
                        caption: caption,
                        imageUrl: downloadURL,
                        username: username
                    });

                    setProgress(0);
                    setCaption('');
                    setImage(null);
                } catch (error) {
                    console.error("Error adding document: ", error);
                    alert(error.message);
                }
            }
        );
    };

    return (
        <div className='imageupload'>
            <progress className='imageupload_progress' value={progress} max="100" />
            <input 
                type="text" 
                placeholder='Enter a caption...' 
                onChange={(e) => setCaption(e.target.value)} 
                value={caption} 
            />
            <input type="file" onChange={handleChange} />
            <Button onClick={handleUpload}>
                Upload
            </Button>
        </div>
    );
}

export default ImageUpload;