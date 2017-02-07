
// now we need ability to go back.
// either keep tree in javascript of where we going each time. or do requests.
// lets do online.
// so we have our parent guy. we need to get his parent and it's children


//server:client_id:
var CLIENT_ID = "582892993246-g35aia2vqj3dl9umucp57utfvmvt57u3.apps.googleusercontent.com"
var SCOPES = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/tasks"
var API_KEY = "AIzaSyD81UMLvDPOz_gOov_9fuaWZopCNwWrS-4"

function Parent(uuid, kind) {
    this.uuid = uuid
    this.kind = kind
}
Parent.prototype.isTask = function() {
    return this.kind == "Task"
}



$(function() {

    viewModel = {
        itemList: ko.observableArray(),
        parent: ko.observable(new Parent(null, null)),
        parentPath: [],
        gTasks: ko.observableArray(),
        onlyDeleted: ko.observable(false),
        onlyCompleted: ko.observable(false),
        selectedItems: ko.observableArray(),
        waitRelease: ko.observable(false),
        moveItems: [],
        moveParent: ""
    }
    viewModel.itemKindClass = ko.pureComputed(function(kind) {
        return kind == "Task" ? "task" : "item";
    }, viewModel);

    viewModel.parent.subscribe(fillItemList)
    viewModel.parent.subscribe(function (val) {

        viewModel.selectedItems.removeAll()

    }, null, "beforeChange")

    viewModel.onlyDeleted.subscribe(function(val) {
        console.log(val)
    })

    viewModel.onlyCompleted.subscribe(function(val) {
        console.log(val)
    })

    ko.applyBindings(viewModel)
})

function itemKindClass(kind) {
    return kind == "Task" ? "task" : "item";
}

function isTask(kind) {
    return kind == "Task"
}

function completeTask(task) {
    task.completeDate = new Date()
    gapi.client.itemsApi.completeTask(task).execute()
}

function back() {
    if (viewModel.parentPath.length == 0) return;
    p = viewModel.parentPath.pop()
    viewModel.parent(p)
}

// we may want to disable other operations
function moveSelected() {
    viewModel.waitRelease(true)
    viewModel.moveItems = viewModel.selectedItems().slice()
    viewModel.itemList.removeAll(viewModel.moveItems)
    viewModel.selectedItems.removeAll()
    viewModel.moveParent = viewModel.parent()
}

function cancelMove() {
    viewModel.waitRelease(false)
    viewModel.moveItems = null
    viewModel.moveParent = ""
}

function releaseMove() {
    // so here we actually move selectedItems to new parent
    var parentUuid = viewModel.parent().uuid
    var items = viewModel.moveItems
    for (var i = 0; i < items.length; ++i) {
        var t = items[i]
        function callback(resp) {
            if (resp.error != null) {
                console.log("move error", resp)
            } else {
                console.log("sucksessful move")
            }
        }

        t.parentUuid = parentUuid
        if (isTask(t.kind)) {
            gapi.client.itemsApi.moveTask(t).execute(callback)
        } else {
            gapi.client.itemsApi.moveItem(t).execute(callback)
        }
    }
    cancelMove()
}

function onItemClick(item) {
    viewModel.parentPath.push(viewModel.parent())
    viewModel.parent(new Parent(item.uuid, item.kind))
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

// Get authorization from the user to access profile info
function initAuth() {
    gapi.client.setApiKey(API_KEY);
    gapi.auth2.init({
        client_id: CLIENT_ID,
        scope: SCOPES,
    }).then(function () {
        console.log("everything is good")
        auth2 = gapi.auth2.getAuthInstance();
        auth2.isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(auth2.isSignedIn.get());
        $('#login').click(auth)
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        console.log(auth2.currentUser.get().getBasicProfile().getGivenName());
        loadApi();
    } else {
        console.log("terrible")
    }

}

function auth() {
    auth2.signIn();
}

// this is where we starting out
function init() {
    gapi.load('client:auth2', initAuth);
}

function loadApi() {
    var apiName = 'itemsApi';
    var apiVersion = 'v2';
    var apiRoot = 'https://' + window.location.host + '/_ah/api';
    if (window.location.hostname == 'localhost'
      || window.location.hostname == '127.0.0.1'
      || ((window.location.port != "") && (window.location.port > 1023))) {
        // We're probably running against the DevAppServer
      apiRoot = 'http://' + window.location.host + '/_ah/api';
    }
    //apiRoot = "https://antoshkaplus-words.appspot.com/_ah/api"


    gapi.client.load(apiName, apiVersion, undefined, apiRoot).then(
        function(response) {
            gapi.client.itemsApi.getRootUuid().execute(function(resp) {
                if (resp.error != null) {
                    console.log("error getRootUuid", resp)
                    return
                }
                console.log(resp.uuid)
                // root is always item
                viewModel.parent(new Parent(resp.uuid, "Item"))
                console.log("root uuid set")
            })
            console.log("api loaded")
        },
        function(reason) {
            console.log("api load failure", reason)
        })
    gapi.client.load('tasks', 'v1', listTaskLists);

}


function GoogleTaskList(taskList) {
    this.updated = taskList.updated
    this.showTasks = ko.observable(false)
    this.tasks = ko.observableArray()
    this.title = taskList.title
}
GoogleTaskList.prototype.toggleShowTasks = function () {
    this.showTasks(!this.showTasks())
}

function GoogleTask(title) {
    var d = new Date()
    d.setDate(d.getDate() - 5);
    this.updated = d
    this.title = title
    this.tasklist = "@default"
    this.fields = "id,updated"
}



function addGoogleTask() {
    title = $('#googleTask').val()

    // i'm inserting new lists here
    // not tasks
    req = gapi.client.tasks.tasks.insert(new GoogleTask(title))
    req.then(function(resp) {
        console.log(resp.result.updated)
    })
}


function importGoogleTasks() {
    // get last update date from our server
    gapi.client.itemsApi.getGoogleTaskLastUpdate().execute(function(resp) {
        if (resp.code) {
            console.log(resp)
            return
        }
        lastUpdate = resp.result.value

        gapi.client.tasks.tasklists.list().then(function(resp) {
            if (resp.code) {
                console.log(resp)
                return
            }

            var taskLists = resp.result.items;
            if (!taskLists) return;
            for (var i = 0; i < taskLists.length; ++i) {
                if (updated.getTime() < lastUpdate) return;


                (function(obj, taskList) {

                function Request() {
                    this.showDeleted = true;
                    this.showHidden = true;
                    this.fields = "nextPageToken,items(id,deleted,completed,updated,status,title)"
                }

                var r = new Request()
                r.tasklist = taskList.id


                gapi.client.tasks.tasks.list(r).then(function handleResult(resp) {


                    token = resp.result.nextPageToken
                    if (token) {
                        var r = new Request()
                        r.tasklist = taskList.id
                        r.pageToken = token
                        gapi.client.tasks.tasks.list(r).then(handleResult)
                    }
                    tasks = resp.result.items
                    if (!tasks) return;

                    for (var j = 0; j < tasks.length; ++j) {
                        obj.tasks.push(tasks[j])
                    }
                    obj.tasks.sort(function (left, right) { return new Date(right.updated) - new Date(left.updated); });
                })



            })(obj, taskList);
            }
        })

    })
    // get all updates with min date from g server... iterate over lists

    // gather everything and send to our server

}


function listTaskLists() {
    gapi.client.tasks.tasklists.list().then(function(resp) {

        gTasks = viewModel.gTasks

        var taskLists = resp.result.items;
        if (!taskLists) return;
        for (var i = 0; i < taskLists.length; ++i) {
            var taskList = taskLists[i];
            obj = new GoogleTaskList(taskList)

            gTasks.push(ko.observable(obj));

            (function(obj, taskList) {

                function Request() {
                    this.showDeleted = true;
                    this.showHidden = true;
                    this.fields = "nextPageToken,items(id,deleted,completed,updated,status,title)"
                }

                var r = new Request()
                r.tasklist = taskList.id
                gapi.client.tasks.tasks.list(r).then(function handleResult(resp) {
                    token = resp.result.nextPageToken
                    if (token) {
                        var r = new Request()
                        r.tasklist = taskList.id
                        r.pageToken = token
                        gapi.client.tasks.tasks.list(r).then(handleResult)
                    }
                    tasks = resp.result.items
                    if (!tasks) return;

                    for (var j = 0; j < tasks.length; ++j) {
                        obj.tasks.push(tasks[j])
                    }
                    obj.tasks.sort(function (left, right) { return new Date(right.updated) - new Date(left.updated); });
                })

            })(obj, taskList);

        }
    });
}

function appendPre(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}


function Item(title) {
    this.title = title
    this.createDate = new Date()
    this.kind = "Item"
    this.uuid = guid()
    this.parentUuid = viewModel.parent().uuid
}

function addTask() {
    title = $('#item').val()
    item = new Item(title)
    item.kind = "Task"
    gapi.client.itemsApi.addTaskOnline(item).execute()

}

function addItem() {
    if (viewModel.parent().isTask()) throw "Can't insert Item into Task."
    title = $('#item').val()
    item = new Item(title)
    item.kind = "Item"
    gapi.client.itemsApi.addItemOnline(item).execute()
}

function fillItemList() {
    gapi.client.itemsApi.getChildrenItems({parentUuid: viewModel.parent().uuid}).execute(function(resp) {
        if (resp.error != null) {
            // need to show some kind of sign to reload browser window
            // later on may try to reload by myself
            console.log("error happened", resp)
            return
        }
        // empty items with such parent
        if (!resp) resp.items = []



        viewModel.itemList(resp.items)
        console.log(resp)
    })
}
