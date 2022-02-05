var excel;
function toggleExcel() {
  $(".row.dt").toggle();
  $(".row.excel").toggle();
}
function getExcelData() {
  $("#myModal").find(".modal-title").html("Bulk data submit");
  $("#myModal")
    .find(".modal-body")
    .html(
      `<center><h4>Are you sure?</h4><div class="btn btn-primary bulk_submit">Confirm</div></center>`
    );
  $("#myModal").modal();

  $(".bulk_submit").click(function () {
    submitExcelData();
  });
}
function submitExcelData() {
  var headers = Object.keys(window.dataSource.table.data()[0]);
  var mod = $(".bulk_edit").attr("data-module");
  var link = $(".bulk_edit").attr("data-ref");

  var json = excel.getData(false);
  var list = [];
  $(json).each((i, v) => {
    var map = {};
    $(v).each((ii, vv) => {
      map[headers[ii]] = vv;
    });

    var has_val = $(v).filter((x, y) => {
      return y != "";
    });

    if (has_val.length > 0) {
      list.push(map);
    }
  });
  $.notify(
    {
      icon: "list",
      message: "Submiting!"
    },
    {
      type: "info",
      timer: 1000,
      placement: {
        from: "top",
        align: "center"
      }
    }
  );
  $(list).each((i, v) => {
    var map = {};
    map[link] = v;
    $.ajax({
      async: false,
      url: "/api/" + link,
      dataType: "json",
      method: "POST",
      data: map
    }).done(function (j) {});
  });
  window.dataSource.table.draw(false);

  $.notify(
    {
      icon: "add_alert",
      message: "Submited!"
    },
    {
      type: "success",
      timer: 1000,
      placement: {
        from: "top",
        align: "center"
      }
    }
  );
  $(".row.dt").toggle();
  $(".row.excel").toggle();
  $("#myModal").modal("hide");
}
function initExcel(dataSource) {
  var keys = Object.keys(dataSource.allData[0]);
  var list = [];
  $(keys).each((i, v) => {
    var width = 200;
    var type = "text";
    if (v.includes("id")) {
      width = 50;
    }
    if (["inserted_at", "updated_at"].includes(v)) {
      type = "hidden";
    }
    list.push({ title: v, name: v, width: width, type: type });
  });
  genExcel(dataSource.table.data(), list);
  $(".row.dt").toggle();
  $(".row.excel").toggle();
}

function genExcel(data, cols) {
  var dd = $(".row.dt")[0];
  var width = dd.offsetWidth * 0.97;
  var options = {
    data: data,
    tableOverflow: true,
    tableWidth: width.toString() + "px",
    tableHeight: "400px",
    minDimensions: [15, 50],
    columns: cols,
    updateTable: function (instance, cell, col, row, val, label, cellName) {},
    onselection: function (instance, x1, y1, x2, y2, origin) {},
    onchange: function (instance, cell, x, y, value) {}
  };

  disposeExcel();
  excel = $("#spreadsheet").jexcel(options);
}

function disposeExcel() {
  if (excel != null) {
    excel.destroy();
  }
}

$(document).on("change", "input[name='users[password]']", function () {
  var v = $("input[name='users[password]']").val();
  $("input[name='users[crypted_password]']").val(hashPW(v));
});

function hashPW(pw) {
  var hashObj = new jsSHA("SHA-512", "TEXT", { numRounds: 1 });
  hashObj.update(pw);
  var hash = hashObj.getHash("HEX");
  return hash;
}

function dtSource(dataSourcesMap) {
  this.dataSources = dataSourcesMap;
  this.populateTables = function (selector, tabTitle) {

    var keys = Object.keys(this.dataSources);
    var liList = [];
    var tabContentList = [];
    $(keys).each((i, v) => {
      if (this.dataSources[v].tableSelector == null) {
        var li =
          `
            <li class="nav-item">
              <a class="am nav-link" href="#link` +
          i +
          `" data-toggle="tab" 
              data-ref="` +
          this.dataSources[v].link +
          `" 
              data-module="` +
          this.dataSources[v].moduleName +
          `">
            ` +
          this.dataSources[v].moduleName +
          `
                <div class="ripple-container"></div>
              </a>
            </li>
        `;
        liList.push(li);

        var tab =
          `
            <div class="tab-pane" id="link` +
          i +
          `">
                <table class="table" id="myTable` +
          i +
          `" style="width: 100%;">
                  <thead>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
            </div>
        `;
        tabContentList.push(tab);
      }
    });

    var card =
      `
        <div class="card">
          <div class="card-header card-header-tabs card-header-rose">
            <div class="nav-tabs-navigation">
              <div class="nav-tabs-wrapper">
                <span class="nav-tabs-title">` +
      tabTitle +
      `</span>
                <ul class="nav nav-tabs " data-tabs="tabs">
                ` +
      liList.join("") +
      `
                </ul>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="tab-content">
            ` +
      tabContentList.join("") +
      `
            </div>
          </div>
          <div class="card-footer">
            <button type="submit" class="btn btn-fill btn-primary form_new" data-href="" data-module="" data-ref="">New</button>
            <button class="btn btn-warning bulk_edit" data-href="" data-module="" data-ref="">Bulk Edit</button>
          </div>
        </div>

    `;
    $(selector).html(card);
    $("a.nav-link").on("click", function () {
      var id = $(this).attr("data-ref");
      var mod = $(this).attr("data-module");
      $(".form_new").attr("data-module", mod);
      $(".form_new").attr("data-ref", id);
      $(".form_new").attr("data-href", $(this).attr("href"));
      $(".bulk_edit").attr("data-module", mod);
      $(".bulk_edit").attr("data-ref", id);
      $(".bulk_edit").attr("data-href", $(this).attr("href"));

      disposeExcel();
    });
    $(".bulk_edit").on("click", function () {
      var link = $(this).attr("data-ref");
      var href = $(this).attr("data-href");
      var mod = $(this).attr("data-module");
      window.dataSource = dataSourcesMap[link];
      initExcel(dataSourcesMap[link]);
    });
    $(".form_new").on("click", function () {
      var link = $(this).attr("data-ref");
      var href = $(this).attr("data-href");
      var mod = $(this).attr("data-module");
      if (link != "") {
        newData({
          link: link,
          mod: mod,
          href: href,
          data: { id: 0 },
          customCols: dataSourcesMap[link].elements
        });
      } else {
        alert("please click on a label");
      }
    });
    $(keys).each((i, v) => {
      if (this.dataSources[v].tableSelector == null) {
        this.dataSources[v].tableSelector = "#myTable" + i;
      }
      this.dataSources[v].table = populateTable(this.dataSources[v]);
    });
    $($("ul.nav-tabs").find("a")[0]).click();
    $(document).ready(function(){
      
      var sources = Object.keys(dataSourcesMap);
      $(sources).each((i, v) => {
        var opt = `<option>` + v + `</option>`;
        $("select#sources").append(opt);
        $("select#sources2").append(opt);
      });
    })

  };

  channel.on("model_update", (payload) => {
    console.log(payload);
    dataSourcesMap[payload.source].table.draw(false);
  });




}





$(document).on("change", "form#mt_button", function () {
  var val = $("select#button").val();
  var code = "";

  var sc = $("select#sources").val();
  $("input[name='link']").val(sc.toString());
  $("input[name='mod']").val(dts.dataSources[sc].moduleName.toString());
  var sc2 = $("select#sources2").val();
  $("input[name='secondary_source']").val(
    dts.dataSources[sc2].moduleName.toLowerCase()
  );
  var link = $("input[name='link']").val();
  var mod = $("input[name='mod']").val();
  var secondary_source = $("input[name='secondary_source']").val();
  var primary_id = $("input[name='primary_id']").val();
  var secondary_id = $("input[name='secondary_id']").val();
  console.log(val);
  switch (val) {
    case "New Assoc": 
      code =
        `
        {
          iconName: "add",
          color: "primary",
          onClickFunction: newAssocData,
          fnParams: {
            targets: [{
                parent: "id",
                child: "` +
        primary_id +
        `"
              }
            ],
            mod: "` +
        mod +
        `",
            link: "` +
        link +
        `",
            href: "#subSubTable",
            data: {
              id: 0,
              ` +
        primary_id +
        `: 0
            },
            customCols: null
          }
        }`;
      break; 
    case "Many To Many Update":
      // code block
      code =
        `
        {
          iconName: "add",
          color: "primary",
          onClickFunction: newAssocData,
          fnParams: {
            targets: [{
                parent: "id",
                child: "` +
        primary_id +
        `"
              }
            ],
            mod: "` +
        mod +
        `",
            link: "` +
        link +
        `",
            href: "#subSubTable",
            data: {
              id: 0,
              ` +
        primary_id +
        `: 0
            },
            customCols: [
              'id',
              '` +
        primary_id +
        `',
              {
                label: "` +
        secondary_id +
        `",
                checkboxes: ` +
        secondary_source +
        `Source.allData,
              }
            ]
          }
        }`;
      break;
    case "Show Assoc":
      // code block
      code =
        `
    {
      iconName: "list",
      color: "info",
      onClickFunction: showAssocData,
      fnParams: {
        customCols: null,
        extraParams: [{
          parent: "id",
          child: "` +
        primary_id +
        `"
        }],
        subSource: ` +
        secondary_source +
        `Source
      }
    }`;
      break;
    default:
      // code block
      code = `
  {
    iconName: "create",
    color: "warning",
    onClickFunction: editData,
    fnParams: {}
  }
          `;
  }

  $("textarea#mt_result").val(code);
});

function newData(params) {
  var dataSource = params.dataSource;
  var mod = params["mod"];
  var link = params["link"];
  var href = params["href"];
  var data = params["data"];
  var customCols = params["customCols"];
  if (dataSource != null) {
    var curData = dataSource.table.data()[params.index];

    if (params.targets != null) {
      $(params.targets).each((i, target) => {
        data[target.child] = curData[target.parent];
      });
    }
  }

  var form =
    `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
          <form style="margin-top: 20px;" class="row with_mod" id="` +
    link +
    `"  module="` +
    mod +
    `">
          </form>
          </div>
        </div>
      </div>
    </div>`;
  $("#myModal")
    .find(".modal-title")
    .html("Create  New " + mod);
  $("#myModal").find(".modal-body").html(form);
  createForm(data, $(href).find("table").DataTable(), customCols);
  $("#myModal").modal();
}

function newAssocData(params) {
  var dataSource = params.dataSource;
  var mod = params["mod"];
  var link = params["link"];
  var href = params["href"];
  var data = params["data"];
  var customCols = params["customCols"];
  if (dataSource != null) {
    var curData = dataSource.table.data()[params.index];
    if (params.targets != null) {
      $(params.targets).each((i, target) => {
        if (target.prefix != null) {
          data[target.child] = target.prefix + curData[target.parent];
        } else {
          data[target.child] = curData[target.parent];
        }
      });
    }
  }

  var form =
    `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
          <form style="margin-top: 20px;" class="row with_mod" id="` +
    link +
    `"  module="` +
    mod +
    `">
          </form>
          </div>
        </div>
      </div>
    </div>`;
  $("#myModal")
    .find(".modal-title")
    .html("Create  New " + mod);
  $("#myModal").find(".modal-body").html(form);
  createForm(data, $(href).find("table").DataTable(), customCols);
  $("#myModal").modal();
}

function populateTable(dataSource) {
  var tr = document.createElement("tr");
  $(dataSource.columns).each(function (i, v) {
    var td = document.createElement("td");
    td.innerHTML = v.label;
    tr.append(td);
  });
  $(dataSource.tableSelector).find("thead").append(tr);
  console.log(dataSource.data);
  var keys = Object.keys(dataSource.data);
  var xparams = [];
  $(keys).each((i, k) => {
    xparams.push("&" + k + "=" + dataSource.data[k]);
  });
  var table = $(dataSource.tableSelector).DataTable({
    processing: true,
    serverSide: true,
    ajax: {
      url: "/api/" + dataSource.link + "?foo=bar" + xparams.join("")
    },
    columns: dataSource.columns,
    rowCallback: function (row, dtdata, index) {
      dataSource.allData.push(dtdata);
      $(row).attr("aria-index", index);
      lastCol = $(row).find("td").length - 1;
      $("td:eq(" + lastCol + ")", row).attr("class", "td-actions");
      $("td:eq(" + lastCol + ")", row).html("");
      $(dataSource.buttons).each((i, params) => {
        params.fnParams.dataSource = dataSource;
        params.fnParams.aParams = dataSource.data;
        var buttonz = new formButton(
          params.iconName,
          params.color,
          params.onClickFunction,
          params.fnParams
        );
        $("td:eq(" + lastCol + ")", row).append(buttonz);
      });
    },
    order: [[0, "desc"]]
  });
  return table;
}

function formButton(iconName, color, onClickFunction, fnParams) {
  var button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("rel", "tooltip");
  button.setAttribute("class", "btn btn-" + color + " btn-round");
  button.setAttribute("data-original-title", "");
  button.setAttribute("title", "");
  var i = document.createElement("i");
  i.className = "material-icons";
  i.innerHTML = iconName;
  button.append(i);
  var div = document.createElement("div");
  div.className = "ripple-container";
  button.append(div);
  button.style = "margin-left: 10px;";
  if (onClickFunction != null) {
    try {
      button.id = fnParams.dtdata.id;
    } catch (e) {
      console.log("dont hav id in fnParams");
    }
    button.onclick = function () {
      fnParams.index = parseInt($($(button).closest("tr")).attr("aria-index"));
      fnParams.row = $(button).closest("tr");
      onClickFunction(fnParams);
    };
  }
  return button;
}

function showAssocDataManyToMany(params) {
  var dt = params.dataSource;
  var table = $(dt.tableSelector).DataTable();
  var r = table.row(params.row);
  var preferedSelector = "subTable";
  if (params["hyperSelector"] != null) {
    preferedSelector = params["hyperSelector"];
  }
  function call() {
    var jj =
      `
        <table class="table" id="` +
      preferedSelector +
      `" style="width:100%">
          <thead>
          </thead>
          <tbody>
          </tbody>
        </table>

            `;
    r.child(jj).show();
    var map = {};
    $(params.extraParams).each((i, xparam) => {
      map["parent"] =
        xparam["child"] + ":" + table.data()[params.index][xparam["parent"]];
    });
    params.subSource.data = map;
    params.subSource.table = populateTable(params.subSource);
  }
  if (r.child.isShown()) {
    if (gParent == this) {
      r.child.hide();
    } else {
      gParent = this;
      call();
    }
  } else {
    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
      this.child.hide();
    });
    gParent = this;
    call();
  }
}

function showAssocData(params) {
  console.log(params);
  var dt = params.dataSource;
  var table = $(dt.tableSelector).DataTable();
  var r = table.row(params.row);
  function call() {
    var jj = `
            <table class="table" id="subTable" style="width:100%">
              <thead>
              </thead>
              <tbody>
              </tbody>
            </table>

          `;
    r.child(jj).show();
    var map = {};
    $(params.extraParams).each((i, xparam) => {
      map[xparam["child"]] = table.data()[params.index][xparam["parent"]];
    });
    params.subSource.data = map;
    params.subSource.table = populateTable(params.subSource);
  }

  if (r.child.isShown()) {
    if (gParent == this) {
      r.child.hide();
    } else {
      gParent = this;
      call();
    }
  } else {
    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
      this.child.hide();
    });
    gParent = this;
    call();
  }
}

function editData(params) {
  var dt = params.dataSource;
  var table = $(dt.tableSelector).DataTable();
  // the dataTable will populate the index and row.
  var r = table.row(params.row);

  var preferedLink;
  if (params.link != null) {
    preferedLink = params.link;
  } else {
    preferedLink = dt.link;
  }
  function call() {
    var jj =
      `<div class="row"><div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <form style="margin-top: 20px;" class="row with_mod" id="` +
      preferedLink +
      `"  module="` +
      dt.moduleName +
      `"></form></div></div></div></div>`;
    r.child(jj).show();

    createForm(table.data()[params.index], table, params.customCols);
  }

  if (r.child.isShown()) {
    if (gParent == this) {
      r.child.hide();
    } else {
      gParent = this;
      call();
    }
  } else {
    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
      this.child.hide();
    });
    gParent = this;
    call();
  }
}

function deleteAssoc(params) {
  var dataSource = params.dataSource;

  var data = params["data"];
  if (dataSource != null) {
    var curData = dataSource.table.data()[params.index];
    if (params.targets != null) {
      $(params.targets).each((i, target) => {
        if (target.prefix != null) {
          data[target.child] = target.prefix + curData[target.parent];
        } else {
          data[target.child] = curData[target.parent];
        }
      });
    }
  }

  console.log(data);

  $.ajax({
    url: "/api/webhook",
    method: "DELETE",
    data: {
      scope: "assoc_data",
      id: curData.id,
      parent: data.parent
    }
  }).done(function () {
    $.notify(
      {
        icon: "add_alert",
        message: "Deleted!"
      },
      {
        type: "success",
        timer: 1000,
        placement: {
          from: "top",
          align: "center"
        }
      }
    );
    dataSource.table.draw(false);
  });
}

function deleteData(params) {
  var dataSource = params["dataSource"];
  var table = $(dataSource.tableSelector).DataTable();
  var dtdata = table.data()[params.index];
  $("#myModal").find(".modal-title").html("Confirm delete this data?");
  var confirm_button = formButton("done_outline", "danger");
  console.log(dataSource);
  confirm_button.onclick = function () {
    $.ajax({
      url: "/api/" + dataSource.link + "/" + dtdata.id,
      dataType: "json",
      method: "DELETE",
      data: dataSource.data
    }).done(function (j) {
      $("#myModal").modal("hide");
      $.notify(
        {
          icon: "add_alert",
          message: "Deleted!"
        },
        {
          type: "success",
          timer: 1000,
          placement: {
            from: "top",
            align: "center"
          }
        }
      );
      dataSource.table.draw(false);
    });
  };
  var center = document.createElement("center");
  center.append(confirm_button);
  $("#myModal").find(".modal-body").html(center);
  $("#myModal").modal();
}

function dataSource(
  link,
  data,
  elements,
  columns,

  tableSelector,
  table,
  allData,
  moduleName,
  buttons
) {
  this.link = link;
  this.data = data;
  this.elements = elements;
  this.columns = columns;
  this.tableSelector = tableSelector;
  this.table = table;
  this.allData = allData;
  this.buttons = buttons;
  this.moduleName = moduleName;
}
function DataSource(
  link,
  data,
  elements,
  columns,
  tableSelector,
  table,
  allData
) {
  this.link = link;
  this.data = data;
  this.elements = elements;
  this.columns = columns;
  this.tableSelector = tableSelector;
  this.table = table;
  this.allData = allData;
}
function repopulateForm(data, formSelector) {
  console.log(data);
  var inputs = $(formSelector).find("[name]");
  $(inputs).each(function (i, v) {
    var name = $(v).attr("name");

    if ($(v).attr("type") == "checkbox") {
      $(v).prop("checked", data[name]);
    } else {
      console.log("data populated");
      console.log(v);
      console.log(name);
      if (data != null) {
        console.log(data[name]);
        $(v).val(data[name]);
      }
    }
  });
}
function repopulateFormInput(data, formSelector) {
  var inputs = $(formSelector).find("[name]");
  $(inputs).each(function (i, v) {
    var name = $(v).attr("aria-label");

    if ($(v).prop("localName") == "select") {
      // $(v).selectpicker("val", data[name]);
      $(v).val(data[name]);
    } else {
      if ($(v).attr("type") == "checkbox") {
        $(v).prop("checked", data[name]);
      } else {
        if (data != null) {
          console.log(name);
          console.log("name: " + name + ", data: " + data[name]);
          $(v).val(data[name]);
        } else {
          console.log("name: " + name + ", data: ?");
        }
      }
    }
  });
}

function createContainer(title, content) {
  if ($("thead").length > 0) {
    $("thead")[0].className = "text-primary";
  }
  var div = document.createElement("div");
  div.className = "card";
  // div.style = "margin-bottom: 5px;margin-top: 0px;"
  var card = document.createElement("div");
  card.setAttribute("class", "card-header card-header-icon card-header-rose");
  var card_icon = document.createElement("div");
  card_icon.setAttribute("class", "card-icon");
  var icon = document.createElement("i");
  icon.className = "material-icons";
  icon.innerHTML = "assignment";
  card_icon.append(icon);
  card.append(card_icon);
  var h4 = document.createElement("h4");
  h4.className = "card-title";
  h4.innerHTML = title;
  card.append(h4);

  div.append(card);
  var body = document.createElement("div");
  body.className = "card-body";
  var resp = document.createElement("div");
  resp.className = "";
  resp.innerHTML = content;
  body.append(resp);
  div.append(body);

  return div;
}

function generateInputs(j, v, object, qv) {
  var input2 = "";
  switch (j[v]) {
    case "string":
      // code block
      input2 =
        '<div class="col-sm-12"><div class="form-group bmd-form-group"><label class="bmd-label-floating">' +
        v +
        '</label><input type="text" aria-label="' +
        v +
        '" name="' +
        object +
        "[" +
        v +
        ']" class="form-control" ></div></div>';
      break;
    case "boolean":
      // code block
      input2 =
        '<div class="col-sm-12"><div class="form-check"><label class="form-check-label"><input class="form-check-input" type="checkbox" aria-label="' +
        v +
        '" name="' +
        object +
        "[" +
        v +
        ']"  value="" >' +
        v +
        '<span class="form-check-sign"><span class="check"></span></span></label></div></div>';
      break;
    case "integer":
      // code block
      if (v.includes("id")) {
        input2 =
          '<input  aria-label="' +
          v +
          '" name="' +
          object +
          "[" +
          v +
          ']" type="hidden" class="form-control" value="0">';
      } else {
        input2 =
          '<div class="col-sm-12"><div class="form-group bmd-form-group"><label class="bmd-label-floating">' +
          v +
          '</label><input type="number" aria-label="' +
          v +
          '" name="' +
          object +
          "[" +
          v +
          ']" class="form-control" ></div></div>';
      }
      break;
    case "naive_datetime":
      // code block datetimepicker
        input2 =
        '<div class="col-sm-12"><div class="form-group bmd-form-group"><label class="bmd-label-floating">' +
        v +
        '</label><input type="text" aria-label="' +
        v +
        '" name="' +
        object +
        "[" +
        v +
        ']" class="form-control datetimepicker" ></div></div>';
      break;
    default:
      // code block
      if (v.includes("id")) {
        input2 =
          '<input  aria-label="' +
          v +
          '" name="' +
          object +
          "[" +
          v +
          ']" type="hidden" class="form-control" value="0">';
      } else {
        input2 =
          '<div class="col-sm-12"><div class="form-group bmd-form-group"><label class="bmd-label-floating">' +
          v +
          '</label><input type="text" aria-label="' +
          v +
          '" name="' +
          object +
          "[" +
          v +
          ']" class="form-control" ></div></div>';
      }
  }

  if (typeof qv == "object") {
    var selections = [];
    if (qv.binary) {
      input2 =
        '<div class="col-sm-12"><div class="form-group bmd-form-group"><label class="bmd-label-floating">' +
        v +
        '</label><textarea rows=4 cols=12 aria-label="' +
        v +
        '" name="' +
        object +
        "[" +
        v +
        ']" class="form-control" ></textarea></div></div>';
    } else {
      $(qv.selection).each(function (index, selection) {
        var name;

        var vall;
        if (typeof selection == "object") {
          name = selection.name;
          vall = selection.id;
        } else {
          name = selection;
          vall = selection;
        }
        selections.push('<option value="' + vall + '">' + name + "</option>");
      });

      input2 =
        '<div class="col-sm-12 pb-3"><div class="form-group bmd-form-group is-filled"><label class="bmd-label-floating">' +
        v +
        '</label><br><br><select aria-label="' +
        v +
        '" name="' +
        object +
        "[" +
        v +
        ']" class="form-control" data-size="' +
        selections.length +
        '" data-style="btn btn-primary btn-round" title="' +
        v +
        '">' +
        selections.join("") +
        "</select></div>";
    }
    if (qv.checkboxes != null) {
      var checkboxes = [];
      $(qv.checkboxes).each((i, checkbox) => {
        var c =
          `
                    <div class="form-check">
                      <label class="form-check-label">
                        <input class="form-check-input" type="checkbox" name="` +
          object +
          "[" +
          v +
          `][` +
          checkbox.id +
          `]"  value="true"> ` +
          checkbox.name +
          `
                        <span class="form-check-sign">
                          <span class="check"></span>
                        </span>
                      </label>
                    </div>`;
        checkboxes.push(c);
      });
      input2 =
        '<div class="col-sm-12 pb-3"><div class="form-group bmd-form-group is-filled"><label class="bmd-label-floating">' +
        v +
        "</label><br>" +
        checkboxes.join("") +
        "<br></div>";
    }
    if (qv.upload) {
      input2 =
        '<div class="col-sm-12"><div class=""><label class="bmd-label-floating">' +
        v +
        '</label><img style="display: none;" id="myImg" src="#" alt="your image" width=300><input style="margin-bottom: 32px;" type="file" aria-label="' +
        v +
        '" name="' +
        object +
        "[" +
        v +
        ']" class="" ></input><br></div></div>';
    }
    if (qv.date) {
      input2 =
        '<div class="col-sm-12"><div class="form-group bmd-form-group"><label class="bmd-label-floating">' +
        v +
        '</label><input type="text" aria-label="' +
        v +
        '" name="' +
        object +
        "[" +
        v +
        ']" class="form-control datepicker" ></div></div>';
    }
    if (qv.alias) {
      input2 =
        '<div class="col-sm-12"><div class="form-group bmd-form-group is-filled"><label class="bmd-label-floating">' +
        v +
        '</label><input type="text" aria-label="' +
        v +
        '" name="' +
        object +
        "[" +
        v +
        ']" class="form-control" ></div></div>';
    }
    if (qv.hidden) {
      input2 =
        '<input type="hidden" aria-label="' +
        v +
        '" name="' +
        object +
        "[" +
        v +
        ']"  >';
    }
  }

  return input2;
}

function createForm(dtdata, table, customCols) {
  $("form.with_mod").each(function (i, xv) {
    // var xv = form ;
    $(xv).html("");
    var mod = $(this).attr("module");
    var object = $(this).attr("id");
    $.ajax({
      url: "/api/webhook?scope=gen_inputs",
      dataType: "json",
      data: {
        module: mod
      }
    }).done(function (j) {
      var cols = Object.keys(j);
      if (customCols != null) {
        cols = customCols;
      }
      console.log(cols.join("','"));
      $(cols).each(function (qi, qv) {
        var v;
        if (typeof qv == "object") {
          v = qv.label;
        } else {
          v = qv;
        }
        var input = "";
        var input2 = "";
        input2 = generateInputs(j, v, object, qv);
        if (typeof qv == "object") {
          var selections = [];
          if (qv.binary) {
          } else {
            if (qv.sub != null) {
              // here insert a smaller form inputs?
              // run the form submission first,
              // get the primary id and stuff it back to parent form
              var subModule = qv.sub.module;
              var subLink = qv.sub.link;
              var customCols = qv.sub.customCols;
              $.ajax({
                url: "/api/webhook?scope=gen_inputs",
                dataType: "json",
                async: false,
                data: {
                  module: subModule
                }
              }).done(function (j) {
                var cols = Object.keys(j);

                if (customCols != null) {
                  cols = customCols;
                }

                var combo = [];
                $(cols).each((i, col) => {
                  var v;
                  if (typeof col == "object") {
                    v = col.label;
                  } else {
                    v = col;
                  }
                  var input3 = "";
                  input3 = generateInputs(j, v, subLink, col);
                  combo.push(input3);
                });

                input2 =
                  input2 +
                  `<div class="row subform"><div class="col-sm-8">` +
                  combo.join("") +
                  `</div></div>`;
              });
            }
          }
        }

        $(xv).append(input2);
      });
      $($(xv).find("select")[0]).on("change", function () {
        var val = $(this).val();
        console.log(val);
        if (val == 0) {
          $(".subform").fadeIn();
        } else {
          $(".subform").hide();
        }
      });
      // $(".selectpicker").selectpicker();
    $('.datetimepicker').datetimepicker({
      format: "YYYY-MM-DD hh:mm:ss",
      icons: {
        time: "fa fa-clock-o",
        date: "fa fa-calendar",
        up: "fa fa-chevron-up",
        down: "fa fa-chevron-down",
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-screenshot',
        clear: 'fa fa-trash',
        close: 'fa fa-remove'
      }
    });
      $(".datepicker").datetimepicker({
        format: "YYYY-MM-DD",
        icons: {
          time: "fa fa-clock-o",
          date: "fa fa-calendar",
          up: "fa fa-chevron-up",
          down: "fa fa-chevron-down",
          previous: "fa fa-chevron-left",
          next: "fa fa-chevron-right",
          today: "fa fa-screenshot",
          clear: "fa fa-trash",
          close: "fa fa-remove"
        }
      });

      var submit_btn = formButton("check", "primary subm");
      submit_btn.onclick = function () {
        var formData = new FormData(xv);
        console.log(formData);
        $.ajax({
          url: "/api/" + object,
          dataType: "json",
          method: "POST",
          enctype: "multipart/form-data",
          processData: false, // tell jQuery not to process the data
          contentType: false,
          data: formData
        })
          .done(function (j) {
            $.notify(
              {
                icon: "add_alert",
                message: "Added!"
              },
              {
                type: "success",
                timer: 1000,
                placement: {
                  from: "top",
                  align: "center"
                }
              }
            );
            if (table != null) {
              console.log("redrawing table.. ");
              console.log(table);
              table.draw(false);

              try {
                if ($("#subSubTable").length > 0) {
                  var subTable = $("#subSubTable").DataTable();
                  subTable.draw(false);
                } else {
                  var subTable = $("#subTable").DataTable();
                  subTable.draw(false);
                }
              } catch (e) {}
            }

            $("#myModal").modal("hide");
          })
          .fail(function (e) {
            console.log(e.responseJSON.status);
            $.notify(
              {
                icon: "add_alert",
                message: "Not Added! reason: " + e.responseJSON.status
              },
              {
                type: "danger",
                timer: 1000,
                placement: {
                  from: "top",
                  align: "center"
                }
              }
            );
          });
      };
      if ($(xv).find(".subm").length == 0) {
        $(xv).append(submit_btn);
      }
      repopulateFormInput(dtdata, xv);
    });
    // return xv;
  });
}
