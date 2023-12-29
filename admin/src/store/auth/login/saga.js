import { call, put, takeEvery, takeLatest } from "redux-saga/effects";

// Login Redux States
import { LOGIN_USER, LOGOUT_USER, SOCIAL_LOGIN } from "./actionTypes";
import { apiError, loginSuccess, logoutUserSuccess } from "./actions";

//Include Both Helper File with needed 
import { postSocialLogin } from "../../../helpers/fakebackend_helper";

import { postLogin } from "../../../helpers/helper";


function* loginUser({ payload: { user, history } }) {
  try {
    if (process.env.REACT_APP_API_URL) {
      const response = yield call(postLogin, {
        userName: user.username,
        password: user.password,
      });

      if (response && response.status === 1) {
        sessionStorage.setItem("authUser", JSON.stringify(response.data));
        yield put(loginSuccess(response));
        history.push("/dashboard-analytics");
      } else {
        yield put(apiError(response));
      }
    }
  } catch (error) {
    yield put(apiError(error));
  }
}

function* logoutUser() {
  try {
    sessionStorage.removeItem("authUser");
    yield put(logoutUserSuccess(LOGOUT_USER, true));
  } catch (error) {
    yield put(apiError(LOGOUT_USER, error));
  }
}

function* socialLogin({ payload: { data, history, type } }) {
  try {
    const response = yield call(postSocialLogin, data);
    sessionStorage.setItem("authUser", JSON.stringify(response));
    yield put(loginSuccess(response));
    history.push("/dashboard-analytics");
  } catch (error) {
    yield put(apiError(error));
  }
}

function* authSaga() {
  yield takeEvery(LOGIN_USER, loginUser);
  yield takeLatest(SOCIAL_LOGIN, socialLogin);
  yield takeEvery(LOGOUT_USER, logoutUser);
}

export default authSaga;
