const socket = io()

const $form = document.querySelector('#message-form')
const $formInput = $form.querySelector('input')
const $formButton = $form.querySelector('button')
const $locationButton = document.querySelector('#Location')
const $messages = document.querySelector('#messages')
const $users = document.querySelector('#sidebar-Users')

const TemplateMessage = document.querySelector('#messageTemplate').innerHTML
const TemplateLocationMessage = document.querySelector('#LocationMessageTemplate').innerHTML
const TemplateSidebar = document.querySelector('#TemplateSidebar').innerHTML

const AutoScroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight - 10<= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

const {username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

socket.on('sendMsg', (msg) => { 
    const htmlmessage = Mustache.render(TemplateMessage, {
        CreatedBy: msg.username,
        message: msg.text,
        CreatedAt: moment(msg.CreatedAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', htmlmessage)
    AutoScroll()
})

socket.on('SendLocMsg', (msg) => {
    const htmlmessage = Mustache.render(TemplateLocationMessage, {
        CreatedBy: msg.username,
        url: msg.text,
        CreatedAt: moment(msg.CreatedAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', htmlmessage)
    AutoScroll()
})

socket.on('RoomData', ({room, users}) => {
    const htmlmessage = Mustache.render(TemplateSidebar, {
        room,
        users
    })
    $users.innerHTML = htmlmessage
})

$form.addEventListener('submit', (e) => {
    e.preventDefault()
    
    $formButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value

    if(message.trim() === ''){
        $formButton.removeAttribute('disabled')
        $formInput.value = ''
        $formInput.focus()

        return
    }

    socket.emit('message', message, (err) => {
        $formButton.removeAttribute('disabled')
        $formInput.value = ''
        $formInput.focus()
        if(err){
            return console.log(err)
        }
    })
})

$locationButton.addEventListener('click', () => {

    $locationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        alert('Geolocation Not Supported')
    }
    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('LocationSend', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })
})

socket.emit('join', {username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})
