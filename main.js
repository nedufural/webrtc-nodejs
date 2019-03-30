//deployed my peerjs to herokuapp
const socket = io('themedapp.herokuapp.com');

// hide the video chat interface
$('#div-chat').hide();

// declare the xirsys for TURN server remote calls
let customConfig;

$.ajax({
  url: "https://service.xirsys.com/ice",
  data: {
    ident: "vanpho",
    secret: "2b1c2dfe-4374-11e7-bd72-5a790223a9ce",
    domain: "vanpho93.github.io",
    application: "default",
    room: "default",
    secure: 1
  },
  success: function (data, status) {
    // data.d is where the iceServers object lives
    customConfig = data.d;
    console.log(customConfig);
  },
  async: false
});


socket.on('ONLINE_USERS_LIST', arrUserInfo => {
    $('#div-chat').show();
    $('#div-dang-ky').hide();

    arrUserInfo.forEach(user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('NEW_USER', user => {
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });

    socket.on('DISCONNECTED', peerId => {
        $(`#${peerId}`).remove();
    });
});

socket.on('DANG_KY_THAT_BAT', () => alert('Vui long chon username khac!'));

function openStream(){
  //get media resources
return  navigator.mediaDevices.getUserMedia({audio:true, video:true})
}

function playStream(VideoIDTag,stream){
  //play media resources
  const video = document.getElementById(VideoIDTag);
  video.srcObject = stream;
  video.play();
}
//begin live streaming locally
//showMyFace().then(stream => playStream('localStream',stream))

// configure my peer with my own server
const peer = new Peer({key: 'peerjs',host:'themedapp.herokuapp.com',secure: true, port: 443, config: customConfig });

peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KY', { ten: username, peerId: id });
    });
});

peer.on('open', id => $('#my-peer').append(id));

//the callers button action
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    //open the stream meaning my media resources and play it
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});
//the Receiver actions

peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    console.log(id);
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});