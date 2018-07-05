const express = require('express');
const router = express.Router();
const passport = require('passport');

const Post = require('../../models/Post');

//const validatePostInput = require('../../validation/post');


router.get('/test', (req, res)  => res.json({msg: "Posts works!"}));

router.get('/', (req, res) => {
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(
            res.status(404).json({ nopostfound: 'No post found with that ID'})
        );
});

router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err =>
        res.status(404).json({ nopostfound: 'No post is found with taht ID'}));
});

router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    // const {errors, isValid} = validatePostInput(req.body);
    //
    // if (!isValid) {
    //     return res.status(400).json(errors);
    // }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res, json(post));

});
    router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
        const errors = {};
        Post.findById(req.params.id)
            .then(post => {
                if(!post) {
                    errors.noprofile = 'There is no post with that id';
                    res.status(404).json(errors);
                }
                if(post.user.toString() !== req.user.id) {
                    return res.status(401).json({ notauthorized: 'User not authorized'});
                }
                if(post.user.toString() !== req.user.id) {
                    res.status(404).json(errors);
                }
                post.remove().then(() => res.json({sucess: true}));
            })
            .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
    });
    router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
        const errors = {};
        Post.findById(req.params.id)
            .then(post => {
                if (!post) {
                    errors.noprofile = 'There is no post with that id';
                    res.status(404).json(errors);
                }
                if (post.likes.filter(like => like.usertoString() === req.user.id).length > 0) {
                    return res.status(400).json({alreadyliked: 'User already liked this post.'})
                }
                post.likes.unshift({user: req.user.id})

                post.save().then(post => res.json(post));
            })
            .catch(err => res.status(404).json({postnotfound: 'no post found'}));
    });

    router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
        const errors = {};
        Post.findById(req.params.id)
            .then(post => {
                if(!post) {
                    errors.noprofile = 'There is no post with that id';
                    res.status(404).json(errors);
                }
                if(post.likes.filter(like => like.user.toString() === req.user.id).length ===0) {
                    return res.sttus(400).json({notliked: 'User has not yet liked this post'})
                }
                const removeIndex = post.likes
                    .map(item => item.user.toString())
                    .indexOf(req.user.id);
                post.likes.splice(removeIndex, 1)
                post.save().then(post => res.json(post));
            })
            .catch(err => res.status(404).json({postnotfound: 'No post found'}));
    });

    router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
        const {errors, isValid} = validatePostInput(req.body);

        if(!isValid) {
            return res.status(400).json(errors);
        }

        Post.findById(req.params.id)
            .then(post => {
                if(!post) {
                    errors.noprofile = 'THere is no post with that id';
                    res.status(404).json(errors);
                }
                const newComment = {
                    text: req.body.text,
                    name: req.body.name,
                    avatar: req.body.avatar,
                    user: req.user.id
                };
                post.comments.unshift(newComment);

                post.save().then(post => res.json(post));
                })
            .catch(err => res.status(404).json({postnotfound: 'No post found'}));
            });

    router.delete('/comment/:id/:comment_id',
        passport.authenticate('jwt', {session: false}),
        (req, res) => {
        Post.findbyId(req.params.id)
            .then(post => {
                if (!post) {
                    errors.noprofile = 'There is no post with that id';
                    res.status(404).json(errors);
                }
                if (post.comments.filter(comment =>
                    comment._id.toString() === req.params.comment_id).length === 0) {
                    return res.status(404).json({commentnotexists: 'Comment does not exist'});
                }
                const removeIndex = post.comments
                    .map(item => item._id.toString())
                    .indexOf(req.params.comment_id);

                post.comments.splice(removeIndex, 1);

                post.save().then(post => res.json(post));
            })
            .catch(err => res.status(404).json({postnotfound: 'No post found'}));
            });


module.exports = router;