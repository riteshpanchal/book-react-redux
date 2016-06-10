import React, { PropTypes } from 'react';
import TaskList from './taskList';
import styles from './project.css';

export const Project = ({ pid, name, descr }) => (
  name
  ? (
    <div className={`project ${styles.project}`}>
      <h1>{name}</h1>
      <p>{descr}</p>
      <TaskList
        pid={pid}
      />
    </div>)
  : (<p>Project {pid} not found</p>)
);

Project.propTypes = {
  pid: PropTypes.string.isRequired,
  name: PropTypes.string,
  descr: PropTypes.string,
};

import { connect } from 'react-redux';

export const mapStateToProps = (state, props) => {
  const pid = props.params.pid;
  const project = state.projects[pid];
  return {
    pid,
    name: project && project.name,
    descr: project && project.descr,
  };
};

import initialDispatcher from 'utils/initialDispatcher.js';
import { getProjectById } from 'store/actions';

export const initialDispatch = (dispatch, nextProps, currentProps, state) => {
  const pid = nextProps.params.pid;
  const prj = pid && state.projects[pid];
  if (!prj || !prj.tids) {
    dispatch(getProjectById(pid));
  }
};

export default initialDispatcher(initialDispatch)(connect(
  mapStateToProps
)(Project));
