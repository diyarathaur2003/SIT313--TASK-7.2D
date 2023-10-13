import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { Container, Grid, Menu, Modal, Header, Button, Image } from 'semantic-ui-react'; // Import Modal components
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc } from 'firebase/firestore';
import './Home.css';


const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // State to manage modal visibility
  const [selectedPost, setSelectedPost] = useState(null); // State to store the selected post
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(collection(db, 'posts'), (snapshot) => {
      let list = [];
      snapshot.docs.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      console.log('Fetched posts:', list);
      setPosts(list);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
    });

    return () => {
      unsub();
    };
  }, []);

  const handleUserProfileClick = () => {
    // Navigate to the user profile page
    navigate('/add');
  };

  // Function to open the modal and set the selected post
  const handleViewClick = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedPost(null);
  };
  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete?')) {
      try {
        // Delete the post from Firestore
        await deleteDoc(doc(db, 'posts', postId));
        // Remove the deleted post from the local state (UI)
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        // Close the modal (if it's open)
        closeModal();
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div>
      {/* Navbar */}
      <div
        style={{
          position: 'sticky',
          top: '0',
          zIndex: '100',
          background: 'black',
          width: '100%', // Ensure it spans the entire width
        }}
      >
        <Menu inverted>
          <Menu.Item>
            <strong>Dev@Deakin App</strong>
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item>
              <button className="ui primary button" onClick={handleUserProfileClick}>
                Add User
              </button>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </div>

      {/* Main Content */}
      <Container>
        <Grid columns={1} stackable>
          {posts &&
            posts.map((item) => (
              <Grid.Column key={item.id} className="post-card">
                <div className="post-title">
                  <strong>Title:</strong> {item.title}
                </div>
                <div className="post-description">
                  <strong>Discription:</strong> {item.content}
                  {/* <input type="text" value={item.content} /> */}
                </div>
                <div className="post-tags">
                  <strong>Tags:</strong> {item.tags}
                </div>
                <div>
                  <Button color="pink" onClick={() => handleViewClick(item)}>
                    View
                  </Button>
                </div>
              </Grid.Column>
            ))}
        </Grid>
      </Container>

      {/* Modal */}
      <Modal open={modalOpen} onClose={closeModal}>
        <Modal.Header>User Details</Modal.Header>
        <Modal.Content image>
          <Image size="medium" src={selectedPost?.img} wrapped />
          <Modal.Description>
            <Header>{selectedPost?.title}</Header>
            {/* <p>{selectedPost?.abstract}</p> */}
            <p>{selectedPost?.content}</p>
            {/* <p>{selectedPost?.articleText}</p> */}
            <p>{selectedPost?.tags}</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color="black" onClick={closeModal}>
            Cancel
          </Button>
          <Button color="red" content="Delete" labelPosition="right" icon="checkmark" onClick={() => handleDelete(selectedPost?.id)} />
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default Home;



