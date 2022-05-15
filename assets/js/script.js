var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // CHECK DUE DATE
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    var arr = []
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};


var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var auditTask = function (taskEl) {
  //GET DATE FROM TASK ELEMENT
  var date = $(taskEl)
    .find("span")
    .text()
    .trim();
  // to ensure element is getting to the function
  console.log(taskEl);

  //CONVERT TO MOMENT OBJECT AT 5PM
  var time = moment(date, "L").set("hour", 17);
  //console.log(time);
  console.log(time);

  //REMOVE OLD CLASSES FROM ELEMENT
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  //APPLY NEW CLASS IF TASK IS NEAR/OVER DUE DATE
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

//Adding jQuery sortable to the parent class
$(".card .list-group").sortable({
  //ENABLES DRAGGING ACROSS LISTS
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event, ui) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function (event, ui) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function (event) {
    console.log(event);
    $(event.target).addClass("dropover-active");
    //THIS WORKS IN THE BROWSER-NOT IN MOD EXAMPLE
    // $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function (event) {
    $(event.target)
      .removeClass("dropover-active");
    //THIS WORKS IN THE BROWSER-NOT IN MOD EXAMPLE     
    // $(".bottom-trash")
    //   .addClass("bottom-trash-active");
  },
  update: function () {
    //make an array to store the task data
    var tempArr = [];

    //loop over current set of children in sortable list
    $(this)
      .children()
      .each(function () {
        //save values in temp array
        tempArr.push({
          text: $(this)
            .find("p")
            .text()
            .trim(),
          date: $(this)
            .find("span")
            .text()
            .trim()
        });
      });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  stop: function (event) {
    $(this).removeClass("dropover");
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function (event, ui) {
    // remove dragged element from the dom
    ui.draggable.remove();
    //PUT IT HERE INSTEAD
    $(".bottom-trash").removeClass("bottom-trash-active");
  },
  over: function (event, ui) {
    console.log(ui);
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function (event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
    // console.log(ui);
  }
});

//ADD DATEPICKER TO HTML ELEMENT MODALDUEDATE
$("#modalDueDate").datepicker({
  minDate: 1,
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();


  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

//USING THE ON() METHOD
$(".list-group").on("click", "p", function () {
  var text = $(this)
    .text()
    .trim();
  //INSTRUCT TO CREATE A NEW TEXTAREA INPUT STORED IN THE VAR TEXTINPUT
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  //INSTRUCT TO SWAP THE P ELEMENT WITH THE NEW TEXT AREA ELEMENT SAVED AS TEXTINPUT
  $(this).replaceWith(textInput);
  // INSTRUCT TO FOCUS
  textInput.trigger("focus");
});

// UNFOCUS
$(".list-group").on("blur", "textarea", function () {
  // get the textarea's current value/text
  var text = $(this)
    .val();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

$(".list-group").on("click", "span", function () {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function () {
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

  // automatically bring up the calendar
  dateInput.trigger("focus");
});


// due date was clicked
$(".list-group").on("click", "span", function () {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function () {
  // get current text
  var date = $(this)
    .val();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  // replace input with span element
  $(this).replaceWith(taskSpan);
  //PASS TASK'S <LI> ELEMENT INTO AUDITTASK() TO CHECK NEW DUE DATE
  auditTask($(taskSpan).closest(".list-group-item"));
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  console.log(tasks);
  saveTasks();
});

// load tasks for the first time
loadTasks();

setInterval(function () {
  $(".card .list-group-item").each(function (index, el) {
    auditTask(el);
  });
}, 18000000);
