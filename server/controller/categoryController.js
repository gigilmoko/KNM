const Category = require('../models/category')
const Product = require('../models/product')
exports.getCategory = async (req, res, next) => {
	try {
		const categories = await Category.find();
		if (!categories || categories.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'No Categories Found'
			});
		}
		res.status(200).json({
			success: true,
			count: categories.length,
			categories
		});
	} catch (error) {
		next(error);
	}
};

exports.newCategory = async (req, res, next) => {
    const category = await Category.create(req.body);
    if (!category) {
        return res.status(400).json({
            success: false,
            message: 'Category not created'
        });
    }
    res.status(201).json({
        success: true,
        category
    });
};

exports.getSingleCategory = async (req, res, next) => {
	const category = await Category.findById(req.params.id);
	if (!category) {
		return res.status(404).json({
			success: false,
			message: 'Category not found'
		})
	}
	res.status(200).json({
		success: true,
		category
	})
}

exports.updateCategory = async (req, res, next) => {
    try {
        let category = await Category.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            {
                new: true,
                runValidators: true 
            }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        return res.status(200).json({
            success: true,
            category
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteCategory = async (req, res, next) => {
	const category = await Category.findByIdAndDelete(req.params.id);
	if (!category) {
		return res.status(404).json({
			success: false,
			message: 'Category not found'
		})
	}

	res.status(200).json({
		success: true,
		message: 'Category deleted'
	})
};

// exports.getCategoryWithProducts = async (req, res, next) => {
//     try {
//         const { categoryId } = req.params;

//         // Find category
//         const category = await Category.findById(categoryId);
//         if (!category) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Category not found'
//             });
//         }

//         // Find products in this category
//         const products = await Product.find({ category: categoryId });

//         res.status(200).json({
//             success: true,
//             category,
//             products,
//             count: products.length
//         });
//     } catch (error) {
//         next(error);
//     }
// };


// exports.getAdminCategories = async (req, res, next) => {
// 	const categories = await Category.find();
// 	if (!categories) {
// 		return res.status(404).json({
// 			success: false,
// 			message: 'Categories not found'
// 		})
// 	}
// 	res.status(200).json({
// 		success: true,
// 		categories
// 	})
// };
