require('express')

const userCollection = require('../../model/userSchema')

// Dashboard and User Management
const dashboard = async (req, res) => {
  try {
    if (req.session.admin) {
      const admin = await userCollection.find();

     
      req.flash('success', 'Admin data loaded successfully!');

      res.render('admin/dashboard.ejs', { success: req.flash('success'), admin }); 
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    
    req.flash('error', 'Error loading admin data');
    console.error('Error loading admin data:', error.message);
    res.render('admin/dashboard.ejs', { error: req.flash('error') }); 
  }
};

const users = async (req, res) => {
  if (req.session.admin) {
    const admin = await userCollection.find();
   
    res.render('admin/users', { admin: admin }); 
   
  } else {
    res.redirect('/admin');
  }
}

const toggleBlockStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const statusId = req.params.id;
    const user = await userCollection.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    
    user.blocked = !user.blocked;

    await user.save();

    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error toggling user status: ' + error.message);
  }
};

const salesReport = async (req, res) => {
  if (req.session.admin) {
    res.render('admin/salesReport')

  }
  else {
    res.redirect('/admin')
  }
}


module.exports = {
  dashboard,
  users,
  toggleBlockStatus,
  salesReport
}