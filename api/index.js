const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const morgan = require('morgan');
var cors = require('cors');
const app = express();
const cron = require('node-cron');
app.use(morgan('combined'));
app.use(
  cors({
    origin: '*',
  })
);
app.use('/', express.static(path.join(__dirname, 'public/images')));
const port = process.env.PORT;
const userRoute = require('./api/routes/userRoute');
const roleRoute = require('./api/routes/roleRoute');
const actionRoute = require('./api/routes/actionRoute');
const roleActionRoute = require('./api/routes/roleActionRoute');
const postRoute = require('./api/routes/postRoute');
const categoryRoute = require('./api/routes/categoryRoute');
const tagRoute = require('./api/routes/tagRoute');
const bannerRoute = require('./api/routes/bannerRoute');
const menuRoute = require('./api/routes/menuRoute');
const leagueRoute = require('./api/routes/leagueRoute');
const shortCodeRoute = require('./api/routes/shortCodeRoute');
const footballRoute = require('./api/routes/footballRoute');
const countRoute = require('./api/routes/countRoute');
const { deleteImages } = require('./api/controllers/postController');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//import routes
app.use('/api/user', userRoute);
app.use('/api/role', roleRoute);
app.use('/api/action', actionRoute);
app.use('/api/roleaction', roleActionRoute);
app.use('/api/post', postRoute);
app.use('/api/category', categoryRoute);
app.use('/api/tag', tagRoute);
app.use('/api/banner', bannerRoute);
app.use('/api/menu', menuRoute);
app.use('/api/league', leagueRoute);
app.use('/api/shortcode', shortCodeRoute);
app.use('/api/football', footballRoute);
app.use('/api/count', countRoute);

cron.schedule('0 0 * * 1', () => {
  deleteImages();
});
app.listen(port, (req, res) => {
  console.log('server listening on port ' + port);
});
