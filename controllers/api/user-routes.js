const router = require('express').Router();
const { User, Blogpost, Comment } = require('../../models');

// GET all users (backend request)
router.get('/', async (req,res) => {
  try {
	// const userData = await User.findAll( { include: [{model: Blogpost}, {model: Comment}] } );
	const userData = await User.findAll( { include: [ {model: Blogpost}, {model: Comment} ] } );

    res.status(200).json(userData);
    
    } catch (err) {
      res.status(500).json(err);
    }
});

// CREATE new user: 'api/users'
router.post('/', async (req, res) => {
    try {
      const dbUserData = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });
  
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.logged_in = true;
  
        res.status(200).json(dbUserData);
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });

router.post('/login', async (req, res) => {
  try {
    console.log('in the login route');
    // Find the user who matches the posted e-mail address
    const userData = await User.findOne({ where: { email: req.body.email } });

    console.log(userData);
    console.log(`USER N A M E: ${userData.username}`);
    // console.log(userData.user.dataValues.username);

    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }
    // Verify the posted password with the password store in the database
    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }
    // Create session variables based on the logged in user
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      
      res.json({ user: userData, message: 'You are now logged in!' });
    });

  } catch (err) {
    res.status(400).json(err);
  }
});

router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    // Remove the session variables
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
