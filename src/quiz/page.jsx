import React from 'react';
import Navbar from '../home/navbar';
import { useState } from 'react';

export default function QuizPage() {
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
  
  const [scores, setScores] = useState(Array(contents.length).fill(null))

  const handleScoreChange = (index, value) => {
    const updatedScores = [...scores];
    updatedScores[index] = value;
    setScores(updatedScores);
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      
      console.log('Form Submitted:', scores);
      // Example: submitToBackend(formData);
  };
  
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700 max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">Compatibility Quiz</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Question name={0} contents={contents[0]} onChange={handleScoreChange}/>
          <Question name={1} contents={contents[1]} onChange={handleScoreChange}/>
          <Question name={2} contents={contents[2]} onChange={handleScoreChange}/>
          <Question name={3} contents={contents[3]} onChange={handleScoreChange}/>
          <Question name={4} contents={contents[4]} onChange={handleScoreChange}/>
          <Question name={5} contents={contents[5]} onChange={handleScoreChange}/>
          <Question name={6} contents={contents[6]} onChange={handleScoreChange}/>
          <Question name={7} contents={contents[7]} onChange={handleScoreChange}/>
          <Question name={8} contents={contents[8]} onChange={handleScoreChange}/>
          <Question name={9} contents={contents[9]} onChange={handleScoreChange}/>
          <div className="flex justify-center">
              <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                  Submit
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Question({ name, contents, onChange }) {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-gray-600 font-medium mb-2">{contents[0]}</h2>
      <ul class="choices">
        <Option name={name} value={1} message={contents[1]} onChange={onChange}/>
        <Option name={name} value={2} message="2" onChange={onChange}/>
        <Option name={name} value={3} message="3" onChange={onChange}/>
        <Option name={name} value={4} message="4" onChange={onChange}/>
        <Option name={name} value={5} message={contents[2]} onChange={onChange}/>
      </ul>
    </div>
  );
};

function Option({ name, value, message, onChange }) {
  return (
    <li>
      <label>
        <input type="radio" name={name} value={value} required onChange={() => onChange(name, value)}></input>{message}
      </label>
    </li>
  )
}