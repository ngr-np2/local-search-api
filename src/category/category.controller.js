const CategoryModel = require("../models/category.model");
const ERROR = require("../utils/Error");

exports.createCategory = async (req, res, next) => {
    try {
        const { label, status } = req.body;
        if (!label) {
            return next(ERROR(401, "enter category name"));
        }
        if (req.role === "ADMIN") {
            const category = new CategoryModel({ label, status });
            await category.save();
            res.status(201).json({ category });
        } else {
            const category = new CategoryModel({ label });
            await category.save();
            res.status(201).json({ category });
        }
    } catch (error) {
        next(error);
    }
};

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await CategoryModel.find();
        if (!categories) return next(ERROR(404, "Category not found"));

        res.json(categories);
    } catch (error) {
        next(error);
    }
};

exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) return next(ERROR(404, "Category not found"));
        res.json(category);
    } catch (error) {
        next(error);
    }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ["label", "status"];
        const isValidOperation = updates.every((update) =>
            allowedUpdates.includes(update)
        );
        if (!isValidOperation) {
            return next(ERROR(400, "Invalid update!"));
        }
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            return next(ERROR(404, "Category not found"));
        }
        updates.forEach((update) => {
            category[update] = req.body[update];
        });
        await category.save();
        res.json(category);
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await CategoryModel.findByIdAndDelete(req.params.id);
        if (!category) {
            return next(ERROR(404, "Category not found"));
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
