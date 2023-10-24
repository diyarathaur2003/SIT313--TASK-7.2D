
import React, { useState } from 'react';
import './Header.css';
import { storage, db } from './firebase';
import { uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const PostPage = () => {
  const [postType, setPostType] = useState('question');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [abstract, setAbstract] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imgURL, setImgURL] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);

  const handlePostTypeChange = (event) => {
    setPostType(event.target.value);
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);

    if (selectedImage) {
      setSelectedImageName(selectedImage.name);
    } else {
      setSelectedImageName('');
    }
  };

  const handleImageUpload = () => {
    if (image) {
      const name = new Date().getTime() + image.name;
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        'state_changed',
        (snapshot) => {},
        (error) => {
          console.error('Error uploading image:', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              setImgURL(downloadURL);
              addImageURLToFirestore(downloadURL);
            })
            .catch((error) => {
              console.error('Error getting image URL:', error);
            });
        }
      );
    } else {
      console.log('No image selected for upload.');
    }
  };

  const addImageURLToFirestore = (downloadURL) => {
    addDoc(collection(db, 'posts'), {
      imageUrl: downloadURL,
      timestamp: serverTimestamp(),
    })
      .then((docRef) => {
        console.log('Image URL added to Firestore with ID: ', docRef.id);
      })
      .catch((error) => {
        console.error('Error adding image URL to Firestore: ', error);
      });
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      setErrorMessage('Please fill in the title and content fields.');
      navigate('/');
      return;
    }
  
    try {
      if (postType === 'question') {
        if (!tags) {
          setErrorMessage('Please fill in all the required fields.');
          return;
        }
  
        await addDoc(collection(db, 'posts'), {
          postType,
          title,
          content,
          tags,
          timestamp: serverTimestamp(),
          imageUrl: imgURL, // Include the image URL in the Firestore document for questions
        });
      } else if (postType === 'article') {
        if (!abstract) {
          setErrorMessage('Please fill in the abstract field.');
          return;
        }
  
        if (!imgURL) {
          setErrorMessage('Please upload an image.');
          return;
        }
  
        await addDoc(collection(db, 'posts'), {
          postType,
          title,
          content,
          abstract,
          timestamp: serverTimestamp(),
          imageUrl: imgURL, // Include the image URL in the Firestore document for articles
        });
      }
  
      console.log('Post added successfully.');
      alert('Thank you for your response');
      setErrorMessage('');
    } catch (error) {
      console.error('Error adding post: ', error);
    }
  };
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleTagsChange = (event) => {
    setTags(event.target.value);
  };

  const handleAbstractChange = (event) => {
    setAbstract(event.target.value);
  };

  const getDescriptionText = () => {
    return postType === 'question'
      ? 'For posting a question, the following section will appear.'
      : 'For posting an article, the following section will appear.';
  };

  return (
    <div>
      <h1 className="style">New Post</h1>
      <div className="Select">
        <label>
          <b>Select Post Type:</b>
        </label>
        <div className="space">
          <label>
            <input
              type="radio"
              value="question"
              checked={postType === 'question'}
              onChange={handlePostTypeChange}
            />
            Question
          </label>
          <label className="space1">
            <input
              type="radio"
              value="article"
              checked={postType === 'article'}
              onChange={handlePostTypeChange}
            />
            Article
          </label>
        </div>
      </div>
      <h1 className="style">What do you want to ask or share</h1>
      <h3>
        <b>
          This section is designed based on the type of the post. It could be
          developed by conditional rendering.{' '}
          <span style={{ color: 'red' }}>{getDescriptionText()}</span>
        </b>
      </h3>
      <div>
        <h4 className="t">
          <b>Title:</b>
        </h4>
        <input
          className="title"
          type="text"
          value={title}
          placeholder={
            postType === 'question'
              ? 'Start your question with how, what, why, etc.'
              : 'Enter a descriptive title'
          }
          onChange={handleTitleChange}
        />
        {postType === 'article' && (
          <>
            <label className="img">
              <b>  Add an Image:</b>
            </label>
            <div className="input">
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <div className="button-container-1">
                <button
                  className="button1"
                  onClick={() => fileInputRef.current.click()}
                >
                  Browse
                </button>
                <button className="button2" onClick={handleImageUpload}>
                  Upload
                </button>
              </div>
            </div>
            {selectedImageName && (
              <p className="selected-image-name">Selected Image: {selectedImageName}</p>
            )}
          </>
        )}
      </div>
      <div>
        {selectedImageName && (
          <div>
            <label className="selected-image-label">
              <b>Selected Image URL:</b>
            </label>
            <p className="selected-image-url">{imgURL}</p>
          </div>
        )}
      </div>
      {postType === 'question' && (
        <div>
          <div>
            <label className="bottom">
              <b>Describe Your Problem:</b>
            </label>
            <label className="bottom1">
              <textarea
                className="content"
                value={content}
                onChange={handleContentChange}
              />
            </label>
          </div>
          <div>
            <label className="diya">
              <b>Tags:</b>
            </label>
            <input
              className="bottom1"
              type="text"
              value={tags}
              placeholder="Please add up to 3 tags to describe what your question is about e.g., Java"
              onChange={handleTagsChange}
            />
          </div>
        </div>
      )}
      {postType === 'article' && (
        <div className="between">
          <label className="abs">
            <b>Abstract:</b>
          </label>
          <label>
            <textarea
              className="bottom4"
              value={abstract}
              placeholder="Enter a 1-paragraph abstract"
              onChange={handleAbstractChange}
            />
          </label>
          <div className="between">
            <label>
              <b>Article Text:</b>
            </label>
            <textarea
              className="bottom2"
              value={content}
              placeholder="Enter the article text"
              onChange={handleContentChange}
            />
          </div>
        </div>
      )}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <div className="button-container">
        <button className="button" onClick={handleSubmit}>
          Post
        </button>
      </div>
    </div>

   );
 };
 export default PostPage;
