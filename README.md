Home In Touch
=============

Install
-------

    git clone https://jed@github.com/jed/homeintouch.git
    cd homeintouch
    npm install

Run
---

Server/client:

    node server.js

Standalone client

    node server.js --clientonly

Flow
----

1. Server startup
  - sets up socket connections
  - exposes http and socket.io

2. Client startup
  - loads all resources from server
  - renders root app
  - connects to server

3. Communication
  - server emits "homes" event with all data
  - server/client emit "address" event when an address changes
  - client emits "save" with same format as "homes" to save state
  - client updates views whenever a device state changes

Models
------

The models are pretty straightforward, mostly forming a hierarchy in which each model contains a list of its submodels. Each model needs to be able to be added and deleted. Modifying is a nice-to-have that can be accomplished with by deleting and re-adding.

### Home
 - id
 - name
 - floors

### Floor
 - id
 - name
 - rooms

### Room
 - id
 - name
 - device_groups

### DeviceGroup
 - id
 - name
 - devices

### Device
 - id
 - name
 - device_type
 - addresses

### Address
 - id
 - current_value

### DeviceType
 - id
 - name
 - address_names

### App
 - current_room
 - current_floor
 - current_home

User interface
--------------

The UI should look something like this. A navbar allows the user to select the home they're viewing in the upper right, and from that home select a given room using the floor dropdowns.

    Logo [Ground Floor \/ | Basement \/ | New floor...]        [ Home 1 \/ ]

    +----------------------------------------------------------------------+
    | Bedroom                                                          | + |
    +----------------------------------------------------------------------+
    +--------------------+   +--------------------+
    | Lights             |   | New Light          |
    |                    |   |                    |
    | Lamp 1 ON          |   | Light name         |
    | Lamp 2 OFF         |   | ____________       |
    |                    |   | Read address       |
    |                    |   | ____________       |
    |                    |   | Write address      |
    |                    |   | ____________       |
    |                    |   |                    |
    +--------------------+   +--------------------+
    |                | + |   | Cancel |    | Save |
    +--------------------+   +--------------------+

Each room consists of a sub-navbar showing the room name and a button for adding a new group, and _n_ rows of up to three device groups. Each device group panel has two modes: a read mode (shown in the left group) in which the status of each device can be viewed and changed, and a write mode (shown in the middle group) in which a given device within the group can be modified.

Communication
-------------

All interaction with the server is performed via Socket.IO.

    socket.on("connect", function(){})
    socket.on("disconnect", function(){})
    socket.on("homes", function(homes){})
    socket.on("address", function(id, value){})

    socket.emit("save", homes)
