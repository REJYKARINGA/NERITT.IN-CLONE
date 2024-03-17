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



const displaySchools = async (req, res, next) => {
  try {
    if (req.session.admin) {
      const pageSize = 10;
      const currentPage = parseInt(req.query.page) || 1;
      const skip = (currentPage - 1) * pageSize;

      const totalProducts = await schoolSchema.countDocuments();
      const totalPages = Math.ceil(totalProducts / pageSize);

      const schools = await schoolSchema.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);

      res.render('admin/schoolDetails', {
        admin: schools,
        currentPage,
        totalPages
      });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    return next(error);
  }
};


const displayCreateSchool = (req, res, next) => {
  try {
    if (req.session.admin) {
      res.render('admin/schoolCreate')
    }
    else {

      res.render('admin/schoolDetails')
    }
  } catch (error) {
    return next(error)
  }
}

const createSchool = async (req, res, next) => {
  try {

    if (!req.session.admin) {
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
    return next(error);
  }
};

const editSchool = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      res.redirect("/admin")
    }

    const schoolId = req.params.id;
    const school = await schoolSchema.findById(schoolId);

    if (!school) {
      return res.status(404).send('Category not found for Edit');
    }

    res.render('admin/schoolEdit', { school });
  } catch (error) {
    return next(error);
  }
};

const updateSchool = async (req, res, next) => {
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
    return next(error);
  }
};

const schoolBlockStatus = async (req, res, next) => {
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
    return next(error);
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