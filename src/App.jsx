import {useState, useEffect} from 'react';
import { Router,useSearchParams } from "react-router-dom";

import Container from '@mui/material/Container';8
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import { TableFooter } from '@mui/material';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import * as Tone from 'tone'


export default function App() {


  const [alarms, setAlarms] = useState([]);
  const [timeInput, setTimeInput] = useState();
  const [phraseInput, setPhraseInput] = useState();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setSearchParams({ 'alarms': window.btoa(JSON.stringify(alarms)) });
  },[alarms]);

  const appendTime = () => {
    if (!timeInput || !phraseInput) return;
    setAlarms(prevAlarms => [...prevAlarms, {time: timeInput, phrase: phraseInput}]);
    
    setTimeInput('');
    setPhraseInput('');
  }

  useEffect(() => {
      setInterval(checkTime, 1000);
      setAlarms(JSON.parse(window.atob(searchParams.get('alarms'))));
  },[]);

  const speakPhrase = (phrase) => {
    const synth = new Tone.Synth().toDestination();
    const now = Tone.now()
    // trigger the attack immediately
    synth.triggerAttack("C4", now)
    // wait one second before triggering the release
    synth.triggerRelease(now + 1)

      setTimeout(()=>{
        const msg = new SpeechSynthesisUtterance()
        msg.text = phrase
        window.speechSynthesis.speak(msg);
      },1000);

  }

  const checkTime = () => {
    let today = new Date(),
    time = today.getHours() + ':' + today.getMinutes();

    alarms.forEach(alarm => {
      if (alarm.time === time) {
        speakPhrase(alarm.phrase)       
      }
    })
  }

  const removeAlarm = (index) => {
    setAlarms(prevAlarms => [...prevAlarms.slice(0, index),...prevAlarms.slice(index + 1)]);
  }

  
  const updateSpecificAlarm = (index, time, phrase) => {
    setAlarms(prevAlarms => [...prevAlarms.slice(0, index), {time: time, phrase: phrase},...prevAlarms.slice(index + 1)]);
  }

  

  return (
    <main>

      <Container>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Phrase</TableCell>
            <TableCell  colSpan={2}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {alarms?.map((alarm,index) => 
          <TableRow key={index}>
            <TableCell><TextField  type="time" name="time" value={alarm.time} onChange={(e)=>updateSpecificAlarm(index,e.target.value,alarm.phrase)}/></TableCell>
            <TableCell><TextField  type="text" name="phrase" value={alarm.phrase} onChange={(e)=>updateSpecificAlarm(index,alarm.time,e.target.value)}/></TableCell>
             <TableCell><Button variant="contained" onClick={()=>removeAlarm(index)}>Remove</Button></TableCell>
             <TableCell><Button variant="contained" onClick={()=>speakPhrase(alarm.phrase)}>Test</Button></TableCell>          
             </TableRow>
        )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell><TextField type="time" name="time" onChange={(e)=>setTimeInput(e.target.value)} value={timeInput}/></TableCell>
            <TableCell><TextField type="text" name="phrase" onChange={(e)=>setPhraseInput(e.target.value)} value={phraseInput}/></TableCell>
            <TableCell>  <Button variant="contained" onClick={appendTime}>Append</Button></TableCell>
            <TableCell><Button variant="contained" onClick={()=>speakPhrase(phraseInput)}>Test</Button></TableCell>        
          </TableRow>
        </TableFooter>
      </Table>

      </Container>
    </main>
  )
}

