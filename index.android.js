/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView
} = React;

var DrawerLayoutAndroid = require('DrawerLayoutAndroid');
var TouchableNativeFeedback = require('TouchableNativeFeedback');
var ToolbarAndroid = require('ToolbarAndroid');

function zeropad(num) {
  return num <= 9 ? ('0' + num) : String(num);
}

function isNumber(num) {
  return !Number.isNaN(num);
}

function isNotEmpty(string) {
  return typeof string !== 'undefined' && string !== '';
}

function offsetChar(character, offset) {
  return String.fromCharCode(character.charCodeAt(0) + offset);
}

function parseTalk(row, offset) {
  var start = Number(row[offsetChar('A', offset)]);
  var duration = Number(row[offsetChar('B', offset)]);
  var id = Number(row[offsetChar('C', offset)]);
  var speaker = row[offsetChar('E', offset)];
  var title = row[offsetChar('F', offset)];
  var link = row[offsetChar('H', offset)];
  var hasSpeaker = isNotEmpty(speaker);
  var hasTitle = isNotEmpty(title);
  var location = 'Back Track';

  if (offset === 9 ) {
    location = 'Side Track';
  }

  if (!isNumber(id) || row[offsetChar('C', offset)] === '') {
    location = 'Tent';
  }

  if (isNumber(start) && isNumber(duration) && hasSpeaker && hasTitle) {
    return {
      start: start,
      duration: duration,
      id: id,
      speaker: speaker,
      title: title,
      link: link,
      location: location
    };
  }
}

function parseSchedule(data) {
  var talks = [];

  var rows = data.feed.entry.reduce((rows, cell) => {
    var row = Number(cell.title.$t.match(/\d+/)[0]);
    var col = cell.title.$t.match(/[A-Z]/)[0];

    if (!rows[row]) {
      rows[row] = {};
    }

    rows[row][col] = cell.content.$t;

    return rows;
  }, {});

  for (var key in rows) {
    var row = rows[key];

    var talk = parseTalk(row, 0); // parse talk at A{n}
    if (talk) {
      talks.push(talk);
    }

    talk = parseTalk(row, 9); // parse talk at J{n}
    if (talk) {
      talks.push(talk);
    }

    var lastTalk = talks[talks.length -1];
    if (!lastTalk) { continue ;}
    var hour = Math.floor(lastTalk.start);
    var minute = Math.round(lastTalk.start % 1 * 100);
    var date = Date.UTC(2015, 8, 25, hour, minute);

    if (Number(key) >= 30) {
      date = Date.UTC(2015, 8, 27, hour, minute);
    }

    lastTalk.start = date;
  }


  return talks;//.sort(function (a, b) { return a.start - b.start; });
}



var jsconfsched = React.createClass({
  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    return {
      ds: ds,
      dataSource: ds.cloneWithRows([
        {
          start: Date.UTC(2015, 8, 25, 6, 30),
          duration: 60,
          speaker: 'all',
          title: 'Breakfast',
          location: 'Tent'
        }
      ]),
    };
  },

  componentDidMount: function () {
    console.log('mounted');
    fetch('https://spreadsheets.google.com/feeds/cells/0AhO5JVicsAJOdGEyUTBZMXVUZXZ2c2tXMDVxcy1aX0E/od4/public/basic?alt=json')
      .then(response => response.json())
      .then(parseSchedule)
      .then(function (talks) {
        console.log('parsed talks');
        this.setState({
          dataSource: this.state.ds.cloneWithRows(talks)
        });
      }.bind(this))
      .catch(err => console.error(err));

    // setTimeout(() => {
    //   this.refs.list.getScrollResponder().scrollTo(100);
    // }, 1000);
  },

  render: function() {
    var navigationView = (
      <View style={styles.drawer}>
        <TouchableNativeFeedback
            onPress={() => {}}
            background={TouchableNativeFeedback.Ripple('#ff0079')}>
          <View style={styles.navEntry}>
            <Text>Day 1</Text>
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback
            onPress={() => {}}
            background={TouchableNativeFeedback.Ripple('#ff0079')}>
          <View style={styles.navEntry}>
            <Text>Day 2</Text>
          </View>
        </TouchableNativeFeedback>
      </View>
    );

    return (
      <View style={{ flex: 1 }}>
        <ToolbarAndroid style={{ height: 50, backgroundColor: '#ff0079', marginBottom: 10 }} title="JSConf EU 2015" titleColor="#ffffff" />
        <DrawerLayoutAndroid
            drawerWidth={300}
            drawerPosition={DrawerLayoutAndroid.positions.Left}
            renderNavigationView={() => navigationView}>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderRow}
            ref="list"/>
        </DrawerLayoutAndroid>
      </View>
    );
  },

  renderRow: function (talk) {
    var date = new Date(talk.start);
    var startTime = date.getDate() + '.09 ' + zeropad(date.getHours()) + ':' + zeropad(date.getMinutes());
    return (
      <View style={styles.talk}>
        <Text>{talk.speaker}</Text>
        <Text style={styles.talkTitle}>{talk.title}</Text>
        <Text>{startTime} | {talk.location}</Text>
      </View>
      );
  }
});

var styles = StyleSheet.create({
  drawer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  navEntry: {
    padding: 20,
    alignSelf: 'stretch',
    borderBottomWidth: 1
  },
  talk: {
    flexDirection: 'column',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    margin: 10,
    marginTop: 0,
    padding: 10
  },
  talkTitle: {
    color: '#ff0079'
  }
});

AppRegistry.registerComponent('jsconfsched', () => jsconfsched);
