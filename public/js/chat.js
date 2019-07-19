const socket = io()
const $messageForm = document.querySelector('#form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocation = document.querySelector('#location')
const $messages = document.querySelector('#messages')


const messageTemplate = document.querySelector('#message-template').innerHTML
const locationmessageTemplate = document.querySelector('#locationmessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix : true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
    
    const newMessageStyles = getComputedStyle($newMessage)
    const newMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of msgs container
    const containerHeight = $messages.scrollHeight

    //extent of scroll
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight

    }   

}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationmessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationmessageTemplate,{
        username : message.username,
        url : message.url,
        createdAt: moment(message.createdAt).format('h:mm:a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({
    room,
    users       
}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault() // to prevent a full page browser refresh

    $messageFormButton.setAttribute('disabled','disabled') // disabling the button unless a msg is delivered

    const message = e.target.elements.msg.value
    socket.emit('returnMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ' '
        $messageFormInput.focus()

        if(error)
            return console.log(error)
        console.log('delivered!')
    })
})

$sendLocation.addEventListener('click',()=>{    
    if(!navigator.geolocation) //check if browser supports geolocation
        return alert('Your browser does not support geolocation!')

    $sendLocation.setAttribute('disabled', 'disabled') //disabling button

    navigator.geolocation.getCurrentPosition((position)=>{                    
        socket.emit('sendLocation',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },()=>{
            $sendLocation.removeAttribute('disabled')
            console.log('location shared!')
        })
    })
})
socket.emit('join',{username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/' //redirect to the root page
    }
})