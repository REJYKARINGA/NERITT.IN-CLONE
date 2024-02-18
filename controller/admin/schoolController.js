require('express')
const fs = require('fs')
const schoolSchema = require('../../model/schoolSchema');

const sizeOf = require('image-size'); 
const isSquare = (width, height) => {
  return width === height;
};

const isLessThan1MP = (width, height) => {
  const megapixels = (width * height) / 1000000;
  return megapixels < 1;
};


// School Management
const displaySchools = async (req, res) => {
  if (req.session.admin) {
    const admin = await schoolSchema.find();
    console.log(admin); 
    res.render('admin/schoolDetails', { admin: admin }); 

  } else {
    res.redirect('/admin');
  }
}

const displayCreateSchool = (req, res) => {
  console.log('create School');
  if (req.session.admin) {
    res.render('admin/schoolCreate')
  }
  else {
    
    console.log('entered to School Details Page ');
    res.render('admin/schoolDetails')
  }
}

const createSchool = async (req, res) => {
  try {
   
    if (!req.session.admin) {
      console.log('Unauthorized. Please log in.')
      return res.redirect('/admin')
    }

    const { school_name,
      email,
      school_address,
      pincode,
      school_district,
      phone_number,
      school_code,
      school_state,
      school_city,
      created_by,
      gst } = req.body;

    const school_logoPath = req.files['school_logo'] ? req.files['school_logo'][0].path : null;

    const logo_dimensions = school_logoPath ? sizeOf(school_logoPath) : null;

    if (
      (logo_dimensions && (!isSquare(logo_dimensions.width, logo_dimensions.height) || !isLessThan1MP(logo_dimensions.width, logo_dimensions.height)))) {
      console.log('Invalid image dimensions');
      if (school_logoPath) {
        fs.unlinkSync(school_logoPath); 
      }
      return res.status(400).send('Invalid image dimensions. Please upload images that meet the criteria.');
    }

   const newSchool = new schoolSchema({
      school_name,
      email,
      school_address,
      pincode,
      school_district,
      phone_number,
      school_code,
      school_state,
      school_city,
      created_by,
      gst,
      school_logo: school_logoPath,
    });

   await newSchool.save();

    res.redirect('/admin/schools');
  } catch (error) {
    console.error('Error creating Schools:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

const editSchool = async (req, res) => {
  try {
   if (!req.session.admin) {
      res.redirect("/admin")
    }

    const schoolId = req.params.id;
    console.log(schoolId)
    const school = await schoolSchema.findById(schoolId);

    if (!school) {
      return res.status(404).send('Category not found for Edit');
    }

    res.render('admin/schoolEdit', { school });
  } catch (error) {
    console.error('Error fetching school for edit:', error);
    res.status(500).send('Internal Server Error');
  }
};

const updateSchool = async (req, res) => {
  try {
    if (!req.session.admin) {
      res.redirect("/admin")
    }
    const schoolId = req.params.id;

    const school_Id = await schoolSchema.findById(schoolId);
    const { school_name,
      email,
      school_address,
      pincode,
      school_district,
      phone_number,
      school_code,
      school_state,
      school_city,
      created_by,
      gst } = req.body;

    const existingSchool = await schoolSchema.findById(school_Id);

    if (!existingSchool) {
      return res.status(404).send('School not found for update');
    }

    const school_logoPath = req.files['school_logo'] ? req.files['school_logo'][0].path : existingSchool.school_logo;

    const logo_dimensions = school_logoPath ? sizeOf(school_logoPath) : null;

    if (
      (logo_dimensions && (!isSquare(logo_dimensions.width, logo_dimensions.height) || !isLessThan1MP(logo_dimensions.width, logo_dimensions.height)))
    ) {
      console.log('Invalid image dimensions');
      if (school_logoPath !== existingSchool.school_logo) {
        fs.unlinkSync(school_logoPath); 
      }
      return res.status(400).send('Invalid image dimensions. Please upload images that meet the criteria.');
    }

    existingSchool.school_name = school_name;
    existingSchool.school_address = school_address;
    existingSchool.email = email;
    existingSchool.pincode = pincode;
    existingSchool.school_district = school_district;
    existingSchool.phone_number = phone_number;
    existingSchool.school_code = school_code;
    existingSchool.school_state = school_state;
    existingSchool.school_city = school_city;
    existingSchool.created_by = created_by
    existingSchool.gst = gst;

    existingSchool.school_logo = school_logoPath;

    await existingSchool.save();

    res.redirect('/admin/schools');
  } catch (error) {
    console.error('Error updating school Details:', error);
    res.status(500).send('Internal Server Error for Updating');
  }
};

const schoolBlockStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await schoolSchema.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    user.blocked = !user.blocked; 

    await user.save();

    res.redirect('/admin/schools'); 
  } catch (error) {
    console.error(error); 
    res.status(500).send('Error toggling user status: ' + error.message);
  }
};



module.exports = {
  displaySchools,
  displayCreateSchool,
  createSchool,
  editSchool,
  updateSchool,
  schoolBlockStatus
}