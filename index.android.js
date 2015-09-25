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

var jsconfsched = React.createClass({
  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    return {
      dataSource: ds.cloneWithRows([
        {
          start: Date.UTC(2015, 8, 25, 6, 30),
          duration: 60,
          speaker: 'all',
          title: 'Breakfast',
          location: 'Tent'
        }, {
          start: Date.UTC(2015, 8, 25, 7, 30),
          duration: 30,
          speaker: 'Curators',
          title: 'Opening JSConf EU 2015',
          location: 'Back Track'
        }, {
          start: Date.UTC(2015, 8, 25, 8, 0),
          duration: 30,
          speaker: 'Jennifer Wong',
          title: 'I Think I Know What You\'re Talking About. But I\'m Not Sure',
          location: 'Back Track'
        }, {
          start: Date.UTC(2015, 8, 25, 8, 30),
          duration: 30,
          speaker: 'Ryan Seddon',
          title: 'So how does the browser actually render a website',
          location: 'Back Track'
        }, {
          start: Date.UTC(2015, 8, 25, 9, 0),
          duration: 15,
          speaker: 'all',
          title: 'Coffee break',
          location: 'Tent'
        }, {
          start: Date.UTC(2015, 8, 25, 9, 15),
          duration: 30,
          speaker: 'Kai Jäger',
          title: 'What it\'s like to live on the Edge',
          location: 'Back Track'
        }, {
          start: Date.UTC(2015, 8, 25, 9, 45),
          duration: 30,
          speaker: 'Sam Richard',
          title: 'Domo Arigato Mr. Roboto',
          location: 'Back Track'
        }, {
          start: Date.UTC(2015, 8, 25, 10, 15),
          duration: 30,
          speaker: 'Denys Mishunov',
          title: 'Illusion of Time. When 60 seconds is not 1 minute',
          location: 'Back Track'
        }, {
          start: Date.UTC(2015, 8, 25, 10, 45),
          duration: 60,
          speaker: 'all',
          title: 'Lunch',
          location: 'Tent'
        }, {
          start: Date.UTC(2015, 8, 25, 11, 45),
          duration: 30,
          speaker: 'Marijn Haverbeke',
          title: 'Salvaging contentEditable: Building a Robust WYSIWYM Editor',
          location: 'Back Track'
        }
      ]),
    };
  },

  componentDidMount: function () {
    console.log('mounted');
    fetch('https://spreadsheets.google.com/feeds/cells/0AhO5JVicsAJOdGEyUTBZMXVUZXZ2c2tXMDVxcy1aX0E/od4/public/basic?alt=json')
      .then(response => response.json())
      .then((data) => {
        console.log('fetched data');
        var rows = data.feed.entry.reduce((rows, cell) => {
          var row = Number(cell.title.$t.match(/\d+/)[0]);
          var col = cell.title.$t.match(/[A-Z]/)[0];

          if (!rows[row]) {
            rows[row] = {};
          }

          rows[row][col] = rows[row][col] = cell.content.$t;

          return rows;
        }, {});

        for (var index in rows) {
          if (Number.isNaN(Number(rows[index]['A']))) {
            delete rows[index];
          }
        }

        console.log(rows);
      });

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
    var startTime = date.getHours() + ':' + zeropad(date.getMinutes());
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
