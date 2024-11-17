import './App.css';

export default function App() {
  const contents=[
    ["How much do you talk?", "1 - Mute", "5 - Fluent in Yapanese"],
    ["How much do you like your alone time?", "1 - Always with people", "5 - Always alone"],
    ["How much do you like/listen to music?", "1 - What is a song", "5 - Cannot live wihtout music"],
    ["How much do you like/play sports?", "1 - I don't go outside", "5 - D1 athlete"],
    ["Do you enjoy partying/drinking?", "1 - Never", "5 - Wilding every night"],
    ["How chill are you?", "1 - Not so easygoing", "5 - Easygoing"],
    ["STEM or art?", "1 - Art", "5 - STEM"],
    ["How would you describe your life currenlty?", "1 - Absolute clownery", "5 - Have life together"],
    ["How fast is your response time?", "1 - Several days", "5 - Immediately"],
    ["What do you enjoy doing?", "1 - Watching a movie in bed", "5 - Adventuring in the Alps"]
  ]
  var scores;

  function getCheckedValue(radioName) {
    var radios = document.getElementsByName(radioName);
    for (var y = 0; y < radios.length; y++)
        if (radios[y].checked) return radios[y].value;
    return 0;
  }

  function submit() {
    for(var i = 0; i < contents.length; i++) {
      var val = getCheckedValue(contents[i][0]);
      if(val === 0) return;
      scores[i] = val;
    }
    document.getElementById("myresults").innerHTML = "Your score is " + scores;
  }
  
  return (
    <div className="quiz">
      <h1>compatibility quiz</h1>
      <div className="quiz_body">
        <Question contents={contents[0]}/>
        <Question contents={contents[1]}/>
        <Question contents={contents[2]}/>
        <Question contents={contents[3]}/>
        <Question contents={contents[4]}/>
        <Question contents={contents[5]}/>
        <Question contents={contents[6]}/>
        <Question contents={contents[7]}/>
        <Question contents={contents[8]}/>
        <Question contents={contents[9]}/>
        <button class="button" onclick="submit()">Submit</button>
        <span id="result">My results will appear here</span>
      </div>
    </div>
  );
};

function Question({ contents }) {
  return (
    <div className="questions">
      <h2>{contents[0]}</h2>
      <ul class="choices">
        <Option name={contents[0]} value={1} message={contents[1]}/>
        <Option name={contents[0]} value={2} message="2"/>
        <Option name={contents[0]} value={3} message="3"/>
        <Option name={contents[0]} value={4} message="4"/>
        <Option name={contents[0]} value={5} message={contents[2]}/>
      </ul>
    </div>
  );
};

function Option({ name, value, message }) {
  return (
    <li>
      <label>
        <input type="radio" name={name} value={value}></input>{message}
      </label>
    </li>
  )
}