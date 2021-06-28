// Load Environment Variables
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import http from 'http';
import fileUpload from 'express-fileupload';
import compression from 'compression';
import MongoDBStoreFactory from 'connect-mongodb-session';
import onFinished from 'on-finished';
import uuid from 'uuid/v4';
import schedule from 'node-schedule';
import rateLimit from 'express-rate-limit';
import winston from '@hypercube/server/serverjs/winstonConfig';
import updatedb from '@hypercube/server/serverjs/updatecards';
import carddb from '@hypercube/server/serverjs/cards';
import CardRating from '@hypercube/server/models/cardrating';
import CardHistory from '@hypercube/server/models/cardHistory';
import render from '@hypercube/server/serverjs/render';

dotenv.config();

const MongoDBStore = MongoDBStoreFactory(session);

// Connect db
mongoose.connect(process.env.MONGODB_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', () => {
  winston.info('Connected to Mongo.');
});

// Check for db errors
db.on('error', (err) => {
  winston.error(err);
});

// Init app
const app = express();

const store = new MongoDBStore(
  {
    uri: process.env.MONGODB_URL,
    collection: 'session_data',
  },
  (err) => {
    if (err) {
      winston.error('Store failed to connect to mongoDB.', { error: err });
    }
  },
);

// gzip middleware
app.use(compression());

// request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(60 * 1000, () => {
    const err = new Error('Request Timeout');
    err.status = 408;
    next(err);
  });
  res.setTimeout(60 * 1000, () => {
    const err = new Error('Service Unavailable');
    err.status = 503;
    next(err);
  });
  next();
});

// per-request logging configuration
app.use((req, res, next) => {
  req.uuid = uuid();

  req.logger = {
    error: (err) => {
      // err.requst = req;
      winston.error({
        message: err.message,
        stack: err.stack,
        request: req,
      });
    },
    info: (message) => winston.info(message),
  };

  res.locals.requestId = req.uuid;
  res.startTime = Date.now();
  onFinished(res, (err, finalRes) => {
    winston.info({
      level: 'info',
      type: 'request',
      remoteAddr: req.ip,
      requestId: req.uuid,
      method: req.method,
      path: req.path,
      status: finalRes.statusCode,
      length: finalRes.getHeader('content-length'),
      elapsed: Date.now() - finalRes.startTime,
    });
  });
  next();
});

// upload file middleware
app.use(fileUpload());

// Body parser middleware
app.use(
  bodyParser.urlencoded({
    limit: '200mb',
    extended: true,
  }),
);
app.use(
  bodyParser.json({
    limit: '200mb',
    extended: true,
  }),
);

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'dist')));
app.use('/jquery-ui', express.static(`${__dirname}/node_modules/jquery-ui-dist/`));

const sessionOptions = {
  secret: process.env.SESSION,
  store,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 * 52, // 1 year
  },
};

// Express session middleware
app.use(session(sessionOptions));

// Express messages middleware
app.use(require('connect-flash')());

app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  res.locals.node_env = app.get('env');
  next();
});

// Passport config and middleware
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

// set CORS header for cube json requests (needs to be here to be included in rate limiter response)
app.use('/cube/api/cubeJSON', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

// apply a rate limiter to the cube json endpoint
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: '429: Too Many Requests',
});
app.use('/cube/api/cubeJSON', apiLimiter);

// check for downtime

if (process.env.DOWNTIME_ACTIVE === 'true') {
  app.use((req, res) => {
    return render(req, res, 'DownTimePage', {
      title: 'Down for Maintenance',
    });
  });
}

// Route files; they manage their own CSRF protection
app.use('/dev', import('@hypercube/server/routes/dev_routes'));
app.use('/cube', import('@hypercube/server/routes/cube/index'));
app.use('/user', import('@hypercube/server/routes/users_routes'));
app.use('/tool', import('@hypercube/server/routes/tools_routes'));
app.use('/comment', import('@hypercube/server/routes/comment_routes'));
app.use('/admin', import('@hypercube/server/routes/admin_routes'));
app.use('/content', import('@hypercube/server/routes/content_routes'));
app.use('/packages', import('@hypercube/server/routes/packages'));

app.use('', import('@hypercube/server/routes/root'));

app.use((req, res) => {
  return render(req, res, 'ErrorPage', {
    requestId: req.uuid,
    title: '404: Page not found',
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  req.logger.error(err);
  if (!res.statusCode) {
    res.status(500);
  }
  return render(req, res, 'ErrorPage', {
    error: err.message,
    requestId: req.uuid,
    title: 'Oops! Something went wrong.',
  });
});

// scryfall updates this data at 9, so his will minimize staleness
schedule.scheduleJob('0 10 * * *', async () => {
  winston.info('String midnight cardbase update...');

  let ratings = [];
  let histories = [];
  if (process.env.USE_S3 !== 'true') {
    ratings = await CardRating.find({}, 'name elo embedding').lean();
    histories = await CardHistory.find({}, 'oracleId current.total current.picks').lean();
  }
  updatedb.updateCardbase(ratings, histories);
});

// Start server after carddb is initialized.
carddb.initializeCardDb().then(() => {
  http.createServer(app).listen(process.env.PORT || 5000, '127.0.0.1', () => {
    winston.info(`Server started on port ${process.env.PORT || 5000}...`);
  });
});
