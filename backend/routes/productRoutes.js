const express =
require("express");

const router =
express.Router();

const auth =
require(
    "../middleware/authMiddleware"
);

const authorize =
require(
    "../middleware/roleMiddleware"
);

const {

    createProduct,

    getProducts,

    getProductById,

    updateProduct,

    deleteProduct

}
=
require(
    "../controllers/productController"
);


// CREATE PRODUCT

router.post(
    "/",
    auth,
    authorize("admin"),
    createProduct
);


// GET ALL PRODUCTS

router.get(
    "/",
    auth,
    getProducts
);


// GET PRODUCT BY ID

router.get(
    "/:id",
    auth,
    getProductById
);


// UPDATE PRODUCT

router.put(
    "/:id",
    auth,
    authorize("admin"),
    updateProduct
);


// DELETE PRODUCT

router.delete(
    "/:id",
    auth,
    authorize("admin"),
    deleteProduct
);

module.exports =
router;