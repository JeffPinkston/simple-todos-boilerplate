import 'react-datepicker/dist/react-datepicker.css';
import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { DropdownButton, MenuItem, Button, Table, Panel } from 'react-bootstrap';
import  DatePicker  from 'react-datepicker';

import { Tasks } from '../api/tasks.js';
import { Albums } from '../api/albums.js';

import Task from './Task.jsx';
import Album from './Album.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

//App component - represents the whole App
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false,
      panelOpen: false,
      selectedDate: moment(),
      albumName: ''
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    //find the text field via the React Reference
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });

    //clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  handleAlbumSubmit(event) {
    event.preventDefault();

    const name = ReactDOM.findDOMNode(this.refs.albumName).value.trim();
    const data = ReactDOM.findDOMNode(this.refs.albumDate).value.trim();
    Albums.insert({
      name: this.state.albumName,
      localtion: '',
      date: this.state.selectedDate
    });

    ReactDOM.findDOMNode(this.refs.albumName).value = '';
    ReactDOM.findDOMNode(this.refs.albumDate).value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted
    })
  }

  handleAlbumChange(e) {
    console.log(e);
  }

  handlePanelToggle() {
     this.setState({ panelOpen: !this.state.panelOpen });
  }

  handleDateChange(date) {
    this.setState({ selectedDate: date });
  }

  handleNameChange() {
    const name = ReactDOM.findDOMNode(this.refs.albumName).value.trim();

    this.setState({ albumName: name });
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;
    if(this.state.hideCompleted){
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
  }

  renderAlbums() {
    let albums = this.props.albums;
    return albums.map((ablum) => (
      <Ablum key={album._id} album={album} />
    ));
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List ({this.props.incompleteCount})</h1>

          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
              />
            Hide Completed Tasks
          </label>

          <AccountsUIWrapper />
          { this.props.currentUser ?
          <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
            <input
              type="text"
              ref="textInput"
              placeholder="Type to add new tasks"
              />
          </form> : ''
          }

        </header>
        <DropdownButton bsStyle={'default'} id={'album-dropdown'} title={'Album'} onSelect={this.handleAlbumChange.bind(this)}>
          <MenuItem eventKey="1">Ten</MenuItem>
          <MenuItem eventKey="2">VS</MenuItem>
        </DropdownButton>
        <Button onClick={this.handlePanelToggle.bind(this)}>
          Open
        </Button>
        <Panel collapsible expanded={this.state.panelOpen}>
        <Table striped bordered condensed hover responsive>
          <thead>
            <tr>
              <th>Album</th>
              <th>Created On</th>
            </tr>
          </thead>
          <tbody>
              {this.renderAlbums()}
          </tbody>
        </Table>
        <input
          type="text"
          ref="albumName"
          placeholder="Album Name"
          onChange={this.handleNameChange.bind(this)}
          />
        <DatePicker
          ref="albumDate"
          selected={this.state.selectedDate}
          onChange={this.handleDateChange.bind(this)}/>
        </Panel>
        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object
};

export default createContainer(() => {
  return {
    tasks: Tasks.find({}, {sort: { createdAt: -1 } }).fetch(),
    albums: Albums.find({}).fetch(),
    albumCount: Albums.find({}).count(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user()
  };
}, App);
