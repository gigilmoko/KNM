const Product = require('../models/product')
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: 'dglawxazg',
    api_key: '655852923368639',
    api_secret: '5hqre3DUxZG5YlOXD5HoSnj4HgQ'
});

exports.deleteImage = async (req, res) => {
    const { public_id } = req.params;

    try {
        const result = await cloudinary.uploader.destroy(public_id);
        console.log('Image deleted:', result); // Log deletion success
        res.json({ success: true, result });
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        res.status(500).json({ success: false, message: 'Failed to delete image' });
    }
};

exports.getProduct = async (req, res, next) => {
	try {
		const products = await Product.find();
		if (!products || products.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'No products Found'
			});
		}
		res.status(200).json({
			success: true,
			count: products.length,
			products
		});
	} catch (error) {
		next(error);
	}
};
	
exports.newProduct = async (req, res, next) => {
    const { name, description, price, category, stock, images } = req.body;

    const product = await Product.create({
        name,
        description,
        price,
        category,
        stock,
        images // Use the images array as it contains URLs and public_ids
    });

    if (!product) {
        return res.status(400).json({
            success: false,
            message: 'Product not created'
        });
    }

    res.status(201).json({
        success: true,
        product
    });
};

exports.getSingleProduct = async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	if (!product) {
		return res.status(404).json({
			success: false,
			message: 'Product not found'
		})
	}
	res.status(200).json({
		success: true,
		product
	})
}

exports.deleteProduct = async (req, res, next) => {
	const product = await Product.findByIdAndDelete(req.params.id);
	if (!product) {
		return res.status(404).json({
			success: false,
			message: 'Product not found'
		})
	}

	res.status(200).json({
		success: true,
		message: 'Product deleted'
	})
};

exports.updateProduct = async (req, res, next) => {
    try {
        const { name, description, price, category, stock, images } = req.body;

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Update product fields
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock = stock || product.stock;

        // Use the images array from the request body directly
        if (images) {
            product.images = images; // This should be the array of image URLs or public IDs
        }

        await product.save();

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

exports.getProductDetails = async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate("category");
    
    if (!product) return next(new ErrorHandler("Product not found", 404));
    
    res.status(200).json({
        success: true,
        product,
    });
};

exports.getProductsByCategory = async (req, res, next) => {
    const { id } = req.params;  // Use 'id' to get the category ID from URL params

    try {
        const products = await Product.find({ category: id });

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No products found for the given category'
            });
        }

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch products by category'
        });
    }
};

exports.searchProduct = async (req, res, next) => {
    try {
        const { keyword } = req.query; // Query parameter for the search keyword

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: "Keyword is required for searching",
            });
        }

        const products = await Product.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } }, // Case-insensitive search in name
                { description: { $regex: keyword, $options: "i" } }, // Case-insensitive search in description
            ],
        });

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found matching the keyword",
            });
        }

        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
