import React, { Component } from 'react'
import Slider from 'react-rangeslider'
// To include the default styles
import 'react-rangeslider/lib/index.css'
import axios from 'axios';
import './App.css';
import ReactGA from 'react-ga';


// Adds wikipedia results for event
class EventWiki extends Component {

  constructor(props){
    super(props);

    if (this.props.selectedEvents.event){
      var wikiResults = (this.props.selectedEvents.wiki_results) ? this.props.selectedEvents.wiki_results : 5;
      var eventType = (this.props.selectedEvents.type && (this.props.selectedEvents.type !== "Header")) ? this.props.selectedEvents.type : '';
      this.getWiki(this.props.selectedEvents.event + ' ' + eventType,wikiResults);
    }

    this.state = {
      startDate: 0,
      endDate: 0,
      blah: 0,
      events: this.props.events,
      selectedEvents: this.props.selectedEvents,
      wikiCopy: ''
    }

  }


  getWiki(searchWiki,wikiResults){

    var searchTitle = encodeURI(searchWiki);
    const wikiApi = 'https://en.wikipedia.org/w/api.php?action=query';
    // finds specified number of wiki pages based on search terms
    var apiCall = wikiApi +
      '&list=search'+
      '&srsearch='+ searchTitle +
      '&format=json'+
      '&formatversion=2'+
      '&srlimit='+ wikiResults +
      '&origin=*';

      axios.get(apiCall).then(response => {
        var wikiText = [];
        var pageID = response.data.query.search[0].pageid;
        var wikiImage = '';
        // finds first image of first related wiki result
        var imageCall = wikiApi +
          '&pageids='+ pageID +
          '&prop=pageimages'+
          '&format=json'+
          '&pithumbsize=250'+
          '&origin=*';

        axios.get(imageCall).then(imageResponse => {

          var i = 0;
          response.data.query.search.forEach(wiki => {

            var snippet = wiki.snippet.replace(/<(?:.|\n)*?>/gm, '');

            if(i === 0 && imageResponse.data.query && imageResponse.data.query.pages[pageID].thumbnail){
              wikiImage = imageResponse.data.query.pages[pageID].thumbnail.source ;
              wikiText.push(<div key={"wiki_" + wiki.title} className="wiki-result"><div className="wiki-image"><img src={wikiImage} alt="{wiki.title}"/></div><div className="wiki-copy"><a href={"https://en.wikipedia.org/?curid=" + wiki.pageid} target="_blank">{wiki.title}</a> {snippet}</div></div>);

            }else{
              wikiText.push(<div key={"wiki_" + wiki.title} className="wiki-result"><div className="wiki-copy"><a href={"https://en.wikipedia.org/?curid=" + wiki.pageid} target="_blank">{wiki.title}</a> {snippet}</div></div>);
            }

            i++;
          })

          this.setState({
            wikiCopy: wikiText
          })

        });

      }).catch(error => {
        console.log('Error fetching and parsing data', error);
      });
  }

  render(){
    return (
      <div className="wiki-results">{this.state.wikiCopy}</div>
    )
  }
}


// displays events of selected year
class EventList extends Component {

  constructor(props){
    super(props);
    this.state = {
      startDate: 0,
      endDate: 0,
      value: 0,
      events: this.props.events,
      selectedEvents: this.props.selectedEvents
    }
  }



  render(){
    var displayEvent = [];

    if (this.props.selectedEvents[0]){
      this.props.selectedEvents.forEach(item => {
        displayEvent.push(<div key={"event_"+item.event} className={"epoch-event " + item.type }><div className={"epoch-event-content " + item.type }><div className={"event-title " + item.type }>{item.event}</div><div className = "event-detail" dangerouslySetInnerHTML={{ __html: item.info }} /> <EventWiki selectedEvents = {item} /></div></div>);
        })
    }else{
      displayEvent.push(<div key={"event_none"} className={"epoch-event "}><div className={"epoch-event-content " }><div className={"event-title "}>Scroll to year.</div></div></div>);
    }

    return (
      <div className="epoch-events">
      {displayEvent}
      </div>
    )
  }
}

// creates year selector
class TimeLine extends Component {
  constructor(props){
    super(props);
    this.state = {
      startDate: 0,
      endDate: 0,
      value: 0,
      events: this.props.events,
      activeEvents: '',
      selectedEvents: ''
    }
  }

  handleChangeStart = () => {
    console.log('Change event started');
  };

  handleChange = value => {

    var activeEvents = []

  if (this.props.events){
    this.props.events.forEach(item => {
      if (this.state.value >= item.start && this.state.value <= item.end){
        activeEvents.push(<div key={item.event} className={"event-title "}>{item.event}</div>);
      }
    })
    this.setState({
      activeEvents: activeEvents,
      value: value
    });
  }else{

    this.setState({
      value: value
    })
  }
  };
  componentWillReceiveProps(nextProps) {
    this.setState({
      selectedEvents: '',
      activeEvents: <div key="scroll-events" className={"event-record "}><div className={"event-title "}>Scroll to year</div></div>,
      value: -1000
    });
  }

  handleChangeComplete = (nextProps) => {
    var activeEvents = [];
    var selectedEvents = [];

    if (this.props.events){
      this.props.events.forEach(item => {
        if (this.state.value >= item.start && this.state.value <= item.end){
          selectedEvents.push(item);
        }
      })
      this.setState({
        activeEvents: activeEvents,
        selectedEvents: selectedEvents
      });
    }
      console.log('Change event completed: ' + this.state.value);
  };

  render () {
    var { value } = this.state;
    var minDate = parseInt(this.props.startDate,0);
    var maxDate = parseInt(this.props.endDate,0);

    if (value > maxDate || value < minDate){
      value = minDate;
    }

    if (this.props.epoch !== ''){
      return (
        <div className="epoch-body">
        <div id="epoch-nav" className="epoch-nav">
        <div className="epoch-title">{this.props.epoch}, Year {value}</div>
        <div className='epoch-slider'>
        <div className="epoch-start date">{this.props.startDate}</div>
        <div className='slider'>
          <Slider
            min={minDate}
            max={maxDate}
            value={value}
            onChangeStart={this.handleChangeStart}
            onChange={this.handleChange}
            onChangeComplete={this.handleChangeComplete}
            />
        </div>
        <div className="epoch-start date">{this.props.endDate}</div>
        </div>
        </div>
          <EventList
            selectedEvents = {this.state.selectedEvents} />
        </div>
      )

    }else{
      return (
        <div className="epoch-body">
        <div className="epoch-events">
        <div className="event-title ">Select Epoch</div>
        </div>
        </div>
      )
    }
  }
}

// Creates Epoch navigation
class Epoch extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: -1000000,
      startDate: '',
      endDate: '',
      epoch: '',
      epochs: '',
      events: '',
      activeEvents: '',
      navPos: 'relative'
    }

  }

  // reads the periods file to determine epoch options
  componentDidMount(){
      axios.get('/json/periods.json').then((response)=>{
          this.setState(()=>{
           return {
             epochs: response.data
           }
        })
    })
  }

  getEpoch(){
    if (this.state.epochs){
      var epochDiv = [];
      this.state.epochs.map((item,key) => {

          var epochSelected = (this.state.epoch === item.epoch) ? 'selected' : '';
        epochDiv.push(<div key={"button"+item.epoch} className={"epoch-button " + item.epoch + " " + epochSelected }  onClick={() => this.selectEpoch(item)}>{item.epoch}</div>);
        return '';
      });
      return <div className="epoch-selectors">{epochDiv}</div>;
    }
  }



  selectEpoch(item){
    // reads events file based on epoch selected
    var fileTitle = item.epoch.toLowerCase().replace(/ /g,"_");
    axios.get('/json/'+ fileTitle +'.json').then((response)=>{
        this.setState(()=>{
           return {
             events: response.data,
             epoch: item.epoch,
             startDate: item.start,
             endDate: item.end,
             value: item.start,
             activeEvents: '',
             selectedEvents: ''
           }
        })
    })
  }

  render () {

    return (
      <div className="epoch-wrapper">
      {this.getEpoch()}
      <TimeLine
        epoch = {this.state.epoch}
        events = {this.state.events}
        startDate = {this.state.startDate}
        endDate = {this.state.endDate} />
      </div>
    )
  }
}


export default Epoch
