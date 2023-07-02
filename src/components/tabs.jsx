import React, { useState } from 'react';
import "./tabs.css";

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div>
      <ul>
        {tabs.map((tab, index) => (
          <li
            key={index}
            className={activeTab === index ? 'active' : ''}
            onClick={() => handleClick(index)}
          >
            {tab.title}
          </li>
        ))}
      </ul>
      <div>
        {tabs.map((tab,index) => (
          <div key={index} style={{ display: activeTab === index ? 'block' : 'none' }}>
            {tab.content}
        </div>
        ))};
      </div>
    </div>
  );
};

export default Tabs;
