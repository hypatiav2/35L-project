import React from 'react';
import Navbar from '../home/navbar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { dbPutRequest } from '../api/db';

export default function QuizPage() {
 const navigate = useNavigate();
 const { isAuthenticated, getSupabaseClient } = useAuth();

 const contents=[
   ["How much do you talk?", "Mute", "Fluent in Yapanese"],
   ["How much do you like your alone time?", "Always with people", "Always alone"],
   ["How much do you like/listen to music?", "What is a song", "Can't live without music"],
   ["How much do you like/play sports?", "I don't go outside", "D1 athlete"],
   ["Do you enjoy partying/drinking?", "Never", "Wilding every night"],
   ["How chill are you?", "Not so easygoing", "Easygoing"],
   ["STEM or art?", "Art", "STEM"],
   ["How would you describe your life currenlty?", "Absolute clownery", "Have life together"],
   ["How fast is your response time?", "Several days", "Immediately"],
   ["What do you enjoy doing?", "Watching a movie in bed", "Adventuring in the Alps"]
  ]

  const [scores, setScores] = useState(Array(contents.length).fill(null))

  const handleScoreChange = (index, value) => {
    const updatedScores = [...scores];
    updatedScores[index] = value;
    setScores(updatedScores);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    function handleResponse(data)
    {
        console.log(data)
    }

    dbPutRequest('/api/v1/vector', { similarity_vector: scores }, handleResponse, isAuthenticated, getSupabaseClient);

    navigate('/home');
  };

  return (
   <div>
     <Navbar />
     <div className="min-h-screen py-8 px-4">
       <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 max-w-2xl mx-auto p-4">Compatibility Quiz</h1>
       <h1 className="text-lg text-gray-600 mb-8 text-center max-w-3xl mx-auto">Our quiz has ten questions designed to assess your values and strengths. We use the results to match you with people whose results suggest a high compatibility score with you. </h1>
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
         <div className="flex justify-center py-8">
             <button
                 type="submit"
                 className="text-blue-600 font-semibold border border-blue-600 px-4 py-2 hover:text-white hover:bg-blue-600 rounded transition"
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
    <div className="max-w-4xl mx-auto p-8 border-t-2">
      <h2 className="text-blue-600 text-lg font-semibold text-center mb-10">{contents[0]}</h2>
      <div className="flex items-center">
        <span className="basis-1/6 text-gray-500 font-medium text-center">{contents[1]}</span>
        <ul className="basis-2/3 flex space-x-4 items-center justify-center">
          <Option name={name} value={1} onChange={onChange} />
          <Option name={name} value={2} onChange={onChange} />
          <Option name={name} value={3} onChange={onChange} />
          <Option name={name} value={4} onChange={onChange} />
          <Option name={name} value={5} onChange={onChange} />
        </ul>
        <span className="basis-1/6 text-gray-500 font-medium text-center">{contents[2]}</span>
      </div>
    </div>
  );
}

function Option({ name, value, onChange }) {
  return (
    <li className="relative">
      <label className="flex items-center justify-center w-16 h-12 rounded-full cursor-pointer">
        <input
          type="radio"
          name={name}
          value={value}
          required
          className="sr-only peer"
          onChange={() => onChange(name, value)}
        />
        <span
          className="block w-12 h-12 border-2 border-gray-300 rounded-full 
          peer-hover:border-blue-600 peer-checked:border-blue-600 
          peer-checked:bg-blue-100"
        ></span>
      </label>
    </li>
  );
}
