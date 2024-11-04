import React, {useEffect, useState, useCallback} from 'react';
import axios from 'axios';

import './App.css';

import List from './Components/List/List';
import Navbar from './Components/Navbar/Navbar';

function App() {
  // Lists for different categories of tickets
  const statusList = ['In progress', 'Backlog', 'Todo', 'Done', 'Cancelled'];
  const userList = ['Abhideep Maity', 'Akansha Punjabi', 'Anoop Sharma', 'Arbaaz Sayyed', 'Harsh Navani'];
  const priorityList = [
    {name:'No priority', priority: 0}, 
    {name:'Low', priority: 1}, 
    {name:'Medium', priority: 2}, 
    {name:'High', priority: 3}, 
    {name:'Urgent', priority: 4}
  ];

  // State variables to manage group and order values, and ticket details
  const [groupValue, setgroupValue] = useState(getStateFromLocalStorage() || 'status');
  const [orderValue, setorderValue] = useState('title');
  const [ticketDetails, setticketDetails] = useState([]);

  // Function to order ticket data based on selected criteria (priority or title)
  const orderDataByValue = useCallback(async (cardsArry) => {
    if (orderValue === 'priority') {
      // Sort tickets by priority in descending order
      cardsArry.sort((a, b) => b.priority - a.priority);
    } else if (orderValue === 'title') {
      // Sort tickets by title in alphabetical order
      cardsArry.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();

        if (titleA < titleB) {
          return -1;
        } else if (titleA > titleB) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    // Update the ticket details state with the ordered array
    await setticketDetails(cardsArry);
  }, [orderValue, setticketDetails]);

  // Function to save the current group value to local storage
  function saveStateToLocalStorage(state) {
    localStorage.setItem('groupValue', JSON.stringify(state));
  }

  // Function to retrieve the group value from local storage
  function getStateFromLocalStorage() {
    const storedState = localStorage.getItem('groupValue');
    if (storedState) {
      return JSON.parse(storedState);
    }
    return null; 
  }

  // Effect to fetch ticket data and manage local storage
  useEffect(() => {
    // Save the current group value to local storage
    saveStateToLocalStorage(groupValue);
    
    async function fetchData() {
      // Fetch ticket data from the API
      const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment'); // API provided in the notion doc link 
      await refactorData(response);
    }
    
    fetchData();

    // Function to refactor the fetched data into a usable format
    async function refactorData(response) {
      let ticketArray = [];
      if(response.status === 200) {
        // Loop through tickets and match them with users
        for(let i = 0; i < response.data.tickets.length; i++) {
          for(let j = 0; j < response.data.users.length; j++) {
            if(response.data.tickets[i].userId === response.data.users[j].id) {
              // Create a new ticket object that includes user information
              let ticketJson = {...response.data.tickets[i], userObj: response.data.users[j]};
              ticketArray.push(ticketJson);
            }
          }
        }
      }
      // Update the ticket details state and order the data
      await setticketDetails(ticketArray);
      orderDataByValue(ticketArray);
    }
    
  }, [orderDataByValue, groupValue]);

  // Function to handle changes in the group value
  function handleGroupValue(value) {
    setgroupValue(value);
    console.log(value);
  }

  // Function to handle changes in the order value
  function handleOrderValue(value) {
    setorderValue(value);
    console.log(value);
  }
  
  return (
    <>
      <Navbar
        groupValue={groupValue}
        orderValue={orderValue}
        handleGroupValue={handleGroupValue}
        handleOrderValue={handleOrderValue}
      />
      <section className="board-details">
        <div className="board-details-list">
          {
            {
              'status' : <>
                {
                  statusList.map((listItem) => {
                    return(<List
                      groupValue='status'
                      orderValue={orderValue}
                      listTitle={listItem}
                      listIcon=''
                      statusList={statusList}
                      ticketDetails={ticketDetails}
                    />);
                  })
                }
              </>,
              'user' : <>
              {
                userList.map((listItem) => {
                  return(<List
                    groupValue='user'
                    orderValue={orderValue}
                    listTitle={listItem}
                    listIcon=''
                    userList={userList}
                    ticketDetails={ticketDetails}
                  />);
                })
              }
              </>,
              'priority' : <>
              {
                priorityList.map((listItem) => {
                  return(<List
                    groupValue='priority'
                    orderValue={orderValue}
                    listTitle={listItem.priority}
                    listIcon=''
                    priorityList={priorityList}
                    ticketDetails={ticketDetails}
                  />);
                })
              }
            </>
            }[groupValue]
          }
        </div>
      </section>
    </>
  );
}

export default App;
