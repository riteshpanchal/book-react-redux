import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryHistory, match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';

import createStore from 'store/createStore';
import clientRoutes from 'client/routes';

import html from './index.html.js';

app.use((req, res, next) => {
  const memoryHistory = createMemoryHistory(req.url);
  const store = createStore(memoryHistory);
  const history = syncHistoryWithStore(memoryHistory, store);
  match(
    { history, routes: clientRoutes, location: req.url },
    (err, redirectLocation, renderProps) => {
      if (err) {
        console.error(err);
        res.status(500).end('Internal server error');
      } else if (redirectLocation) {
        res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      } else if (renderProps) {
        if (renderProps.routes.find(route => route.path === '*')) {
          next();
        } else {
          Promise.all(renderProps.routes.map(route => {
            const initialDispatch = route.component.WrappedComponent.initialDispatch;
            return typeof initialDispatch === 'function'
            ? initialDispatch(store.dispatch, renderProps, null, store.getState())
            : undefined;
          })).then(
            () => {
              const initialView = renderToString(
                <Provider store={store}>
                  <RouterContext {...renderProps} />
                </Provider>
              );
              const finalState = JSON.stringify(store.getState());
              res.status(200).type('html').end(html(initialView, finalState));
            },
            reason => {
              console.error(reason);
              res.status(500).end(`Internal server error \n${reason}`);
            }
          );
        }
      } else {
        next();
      }
    }
  );
});
