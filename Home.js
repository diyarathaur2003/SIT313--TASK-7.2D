
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { Container, Grid, Menu, Modal, Header, Button, Image } from 'semantic-ui-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc } from 'firebase/firestore';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterTitle, setFilterTitle] = useState('');
  const [filterTag, setFilterTag] = useState('');
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
    navigate('/add');
  };

  const handleViewClick = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPost(null);
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete?')) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
        closeModal();
      } catch (err) {
        console.log(err);
      }
    }
  };

  const formatFirestoreDate = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      const date = new Date(timestamp.toDate());
      return date.toISOString().split('T')[0]; // Formats the date as "Year-month-date"
    }
    return 'N/A';
  };

  return (
    <div>
      <div
        style={{
          position: 'sticky',
          top: '0',
          zIndex: '100',
          background: 'black',
          width: '100%',
        }}
      >
        <Menu inverted>
          <Menu.Item>
            <strong>Dev@Deakin App</strong>
          </Menu.Item>
          <Menu.Item>
            <strong>FIND QUESTIONS</strong>
          </Menu.Item>
          <Menu.Menu position=" right">
            <Menu.Item>
              <button className="ui primary button" onClick={handleUserProfileClick}>
                Add User
              </button>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </div>

      <Container>
        <div className="filter-section">
          <input
            type="text"
            placeholder="Filter by Date (YYYY-MM-DD)"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by Title"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by Tag"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          />
        </div>
        <Grid columns={1} stackable>
          {posts
            .filter((post) => {
              const lowerCaseTitle = post.title ? post.title.toLowerCase() : '';
              const lowerCaseTag = post.tags ? post.tags.toLowerCase() : '';
              const postDate = post.timestamp ? formatFirestoreDate(post.timestamp) : 'N/A';
              const filterDateObj = filterDate ? filterDate : '';

              return (
                (!filterDateObj || postDate.includes(filterDateObj)) &&
                lowerCaseTitle.includes(filterTitle.toLowerCase()) &&
                lowerCaseTag.includes(filterTag.toLowerCase())
              );
            })
            .map((item) => {
              const postDate = item.timestamp ? formatFirestoreDate(item.timestamp) : 'N/A';
              return (
                <Grid.Column key={item.id} className="post-card">
                  <div className="post-title">
                    <strong>Title:</strong> {item.title}
                  </div>
                  <div className="post-description">
                    <strong>Description:</strong> {item.content}
                  </div>
                  <div className="post-tags">
                    <strong>Tags:</strong> {item.tags}
                  </div>
                  <div className="post-date">
                    <strong>Date:</strong> {postDate}
                  </div>
                  <div>
                    <Button color="pink" onClick={() => handleViewClick(item)}>
                      View
                    </Button>
                  </div>
                </Grid.Column>
              );
            })
          }
        </Grid>
      </Container>

      <Modal open={modalOpen} onClose={closeModal}>
        <Modal.Header>User Details</Modal.Header>
        <Modal.Content image>
          <Image size="medium" src={selectedPost?.img} wrapped />
          <Modal.Description>
            <Header>{selectedPost?.title}</Header>
            <p>{selectedPost?.content}</p>
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
