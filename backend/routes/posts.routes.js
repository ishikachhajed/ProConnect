import {Router} from 'express';
import multer from "multer";
import {
  activeCheck,
  createPost,
  getAllPosts,
  deletePost,
  commentPost,
  get_comments_by_post,
  delete_comment_of_user,
  increment_likes
} from "../controllers/posts.controller.js";



const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage });

//GET http://localhost:9090/api/posts/
router.route('/').get(activeCheck);

//POST http://localhost:9090/api/posts/
router.route('/').post(upload.single('media'), createPost);

//GET http://localhost:9090/api/posts/posts
router.route("/posts").get(getAllPosts);

router.route("/delete_post").post(deletePost);

router.route("/comment").post(commentPost);

router.route("/get_comments").get(get_comments_by_post);

router.route("/delete_comment").post(delete_comment_of_user);

router.route("/increment_post_likes").post(increment_likes);

export default router;