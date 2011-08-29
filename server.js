var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')
, url = require('url')

app.listen(8001);

var clients = {};

function handler (req, res) {
    filepath = url.parse(req.url).pathname;

    fs.readFile(__dirname + filepath,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end(err.toString());
            }

            res.writeHead(200);
            res.end(data);
    });
}

io.sockets.on("connection", function (socket) {

    socket.on("login", function(data) {
        clients[socket.id] = { username: data.username, socket: socket, color: data.color, old_x : 0, old_y : 0 };
    });

    socket.on("client message", function (data) {
        for(var s in clients) {
            clients[s].socket.emit("server message", { text: clients[socket.id].username+": "+data.text });
        }
    });

    socket.on("client move", function(data) {
        var src_c = clients[socket.id];
        if(src_c != undefined) {
            for(var s in clients) {
                var c = clients[s];
                if(socket.id != c.socket.id) {
                    c.socket.emit("server move", { x: data.x, y: data.y, color: src_c.color, old_x: src_c.old_x, old_y: src_c.old_y });
                }
            }
            src_c.old_x = data.x;
            src_c.old_y = data.y;
        }
    });
});
