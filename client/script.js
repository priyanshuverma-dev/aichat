import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
    element.textContent = '';
    loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '....') {
        element.textContent = '';
    }
    },300);


}

function typeText(element, text) {
    let index = 0;
    const interval = setInterval(() => {
        if(index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }else{
            clearInterval(interval);
        }
    }, 20);
}


function generateUniqueId() {
    const timestamp = Date.now();
    const randomNum = Math.random();
    const hexadecimalString = randomNum.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;

    
}


function chatStrip(isAl , value , uniqueId){
    return (
        `
        <div class="wrapper ${isAl && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAl ? bot : user} 
                      alt="${isAl ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
    
}

const handleSubmit = async (e)=>{
    e.preventDefault();

    const data = new FormData(form);

    // user message
    chatContainer.innerHTML += chatStrip(false, data.get('prompt'));
    form.reset();

    // bot message

    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStrip(true, " ", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;
    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);

    // fetch data from server

    const response = await fetch(`http://localhost:5000/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt'),
        }),
    });
    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();

        console.log(parsedData);

        typeText(messageDiv, parsedData);
    }
    else {
        const err = await response.text();
        messageDiv.innerHTML = "Oops! Something went wrong.";
        alert(err);

    }
};


form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup',(e)=>{
    if(e.keyCode === 13) {
        handleSubmit(e);
    }
});






