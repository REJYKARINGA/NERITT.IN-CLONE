require('express')

const fs = require('fs')

const categorySchema = require('../../model/categorySchema');

const sizeOf = require('image-size');
const isSquare = (width, height) => {
  return width === height;
};

const isLessThan1MP = (width, height) => {
  const megapixels = (width * height) / 1000000;
  return megapixels < 1;
};



const categories = async (req, res, next) => {
  try {
    if (req.session.admin) {
      const admin = await categorySchema.find();
      res.render('admin/categories', {
        admin: admin,
        success: req.flash('success'),
        error: req.flash('error')
      });

    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    return next(error);
  }
}

const createCategory = async (req, res, next) => {
  try {

    if (!req.session.admin) {
      req.flash('success', 'Unauthorized. Please log in.');
      return res.redirect('/admin');
    }

    const { category_name, description, in_home } = req.body;
    let categoryToUpper = category_name.toUpperCase();
    const isCategoryExist = await categorySchema.findOne({ category_name: categoryToUpper });

    if (isCategoryExist) {
      req.flash('success', 'Category already exists.');
      return res.redirect('/admin/categories');
    }


    const logo_imagePath = req.files['logo_image'] ? req.files['logo_image'][0].path : null;


    const logo_dimensions = logo_imagePath ? sizeOf(logo_imagePath) : null;


    if (
      (logo_dimensions && (!isSquare(logo_dimensions.width, logo_dimensions.height) || !isLessThan1MP(logo_dimensions.width, logo_dimensions.height)))
    ) {

      if (logo_imagePath) {
        fs.unlinkSync(logo_imagePath);
      }
      req.flash('success', 'Invalid image dimensions. Please upload images that meet the criteria.');
      return res.redirect('/admin/categories');
    }

    const newCategory = new categorySchema({
      category_name: categoryToUpper,
      description,
      in_home: in_home === '1',
      logo_image: logo_imagePath
    });


    await newCategory.save();
    req.flash('success', 'Category created successfully.');
    res.redirect('/admin/categories');
  } catch (error) {

    return next(error);

  }
};

const editCategory = async (req, res, next) => {
  try {

    const categoryId = req.params.id;
    const category = await categorySchema.findById(categoryId);


    res.render('admin/editCategory', { success: req.flash('success'), error: req.flash('error'), category });
  } catch (error) {

    return next(error);
  }
}

const updateCategory = async (req, res, next) => {
  let categoryId;
  try {

    if (!req.session.admin) {
      return res.redirect("/admin");
    }

    categoryId = req.params.id;


    const existingCategory = await categorySchema.findById(categoryId);

    if (!existingCategory) {
      return res.status(404).send('Category not found for update');
    }

    const { category_name, description, in_home } = req.body;


    const isCategoryExist = await categorySchema.findOne({
      category_name: category_name.toUpperCase(),
      _id: { $ne: categoryId }
    });

    if (isCategoryExist) {

      req.flash('error', 'Category name already exists');
      return res.redirect(`/admin/edit/${categoryId}`);
    }

    const logo_imagePath = req.files['logo_image'] ? req.files['logo_image'][0].path : existingCategory.logo_image;

    const logo_dimensions = logo_imagePath ? sizeOf(logo_imagePath) : null;

    if (
      (logo_dimensions && (!isSquare(logo_dimensions.width, logo_dimensions.height) || !isLessThan1MP(logo_dimensions.width, logo_dimensions.height)))
    ) {
      if (logo_imagePath !== existingCategory.logo_image) {
        fs.unlinkSync(logo_imagePath);
      }
      return res.send('Invalid image dimensions. Please upload images that meet the criteria.');
    }

    existingCategory.category_name = category_name.toUpperCase();
    existingCategory.description = description;
    existingCategory.in_home = in_home === '1';
    existingCategory.logo_image = logo_imagePath;

    await existinbgCategory.save();

    req.flash('success', 'Category updated successfully');
    res.redirect('/admin/categories');
  } catch (error) {

    return next(error);
  }
};


module.exports = {
  categories,
  createCategory,
  editCategory,
  updateCategory,

}
