const Product = require('../models/product')
const cloudinary = require('cloudinary')

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
    let images = [];
    
        if (typeof req.body.images === "string") {
        images.push(req.body.images);
        } else {
        images = req.body.images;
        }
    
        let imagesLinks = [];

	for (let i = 0; i < images.length; i++) {
		let imageDataUri = images[i]
		try {
			const result = await cloudinary.v2.uploader.upload(`${imageDataUri}`, {
				folder: 'KBituin',
				width: 150,
				crop: "scale",
			});

			imagesLinks.push({
				public_id: result.public_id,
				url: result.secure_url
			})

		} catch (error) {
			console.log(error)
		}
	}
    
    req.body.images = imagesLinks
	// req.body.user = req.user.id;

	const product = await Product.create(req.body);
	if (!product)
		return res.status(400).json({
			success: false,
			message: 'Product not created'
		})
	res.status(201).json({
		success: true,
		product
	})
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
		let product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found'
			});
		}

		let cloudinaryImages = product.images || [];
		let newImages = [];

		if (req.body.images) {
			if (typeof req.body.images === 'string') {
				newImages.push(req.body.images);
			} else if (Array.isArray(req.body.images)) {
				newImages = req.body.images;
			} else {
				newImages.push(req.body.images);
			}

			let isImageFromComputer = false;
			for (let i = 0; i < newImages.length; i++) {
				if (!newImages[i].includes('cloudinary')) {
					isImageFromComputer = true;
					break;
				}
			}

			if (isImageFromComputer) {
				cloudinaryImages = [];
				for (let i = 0; i < newImages.length; i++) {
					try {
						const result = await cloudinary.v2.uploader.upload(newImages[i], {
							folder: 'products',
							width: 150,
							crop: 'scale'
						});
						cloudinaryImages.push({
							public_id: result.public_id,
							url: result.secure_url
						});
					} catch (error) {
						console.error('Error uploading image:', error);
					}
				}
			} else {
				cloudinaryImages = newImages;
			}
		}

		const updatedFields = { ...req.body };
		updatedFields.images = cloudinaryImages;

		product = await Product.findByIdAndUpdate(req.params.id, updatedFields, {
			new: true,
			runValidators: true,
			useFindAndModify: false
		});

		if (!product) {
			return res.status(400).json({
				success: false,
				message: 'Product not updated'
			});
		}

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