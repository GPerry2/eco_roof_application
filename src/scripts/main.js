let config;

$(function () {
  let cotApp, form, ECOModel;
  cotApp = new CotApp();

  //@if ENV='local'
  cotApp.appContentKeySuffix = '';
  //@endif

  cotApp.loadAppContent(
    {
      keys: ["eco_roof_config", "eco_roof_terms", "eco_roof_intro", "eco_roof_decline"],
      onComplete: function (data) {
        let key = "eco_roof_config";
        //@if ENV='local'
        config = JSON.parse(data[key]);
        config.terms = data["eco_roof_terms"];
        config.terms_decline = data["eco_roof_decline"];
        config.into = data["eco_roof_intro"];
        //@endif
        //@if ENV!='local'
        config = data[key];
        config.terms = data["eco_roof_terms"];
        config.terms_decline = data["eco_roof_decline"];
        config.into = data["eco_roof_intro"];
        //@endif

/*
        CotApp.showTerms({
          termsText: config.terms,
          disagreedText: config["terms-decline"],
          containerSelector: '#form_view',
          agreedCookieName: config.default_repo + '_terms_cookie',
          onAgreed: function () {
            init();
          },
          onDisagreed: function () {
          },
          agreementTitle: 'Terms of Use Agreement'
        });
        */
        showTerms();

      }
    }
  );

  let ECOForm = CotView.extend({
    initialize: function () {
    },
    render: function (container) {
      container.append(this.el);
      this._form = new CotForm(this.formDefinition());
      this._form.render({target: this.el});
      this._form.setModel(this.model);

      return this;
    },
    formDefinition: function () {
      return {
        id: this.id + '_cot_form',
        title: this.title,
        rootPath: '/resources/eco_roof_application/',
        success: function () {
          
          $(".dz-hidden-input").prop("disabled", true);
          $(":input").prop("disabled", true);
          $("#printbtn").prop('disabled', false);


          let payload = ECOModel.toJSON();
          let uploadedFiles = [];
          let bin_id = [];
          $.each(payload.uploadedFiles, function (i, row) {
            let json = JSON.parse(row.xhr.response);
            json.name = row.name;
            json.type = row.type;
            json.size = row.size;
            json.status = "keep";
            json.bin_id = json.BIN_ID[0];
            bin_id.push(json.BIN_ID[0]);
            delete json.BIN_ID;
            uploadedFiles.push(json);
          });
          //payload.app_uploadedFiles = "";
          payload.uploadedFiles = uploadedFiles;
          payload.unid = "public submission";
          payload.AppStatus = "New";

          $.ajax({
            url: config.httpHost.app_public['/* @echo ENV*/'] + config.api.api_public.uploadStatus + config.default_repo + "/application?keepfiles=" + bin_id.join(),
            type: 'POST',
            data: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json; charset=utf-8;',
              'Cache-Control': 'no-cache'
            },
            dataType: 'json',
            success: function (data) {
              if (data.EventMessageResponse && data.EventMessageResponse.Response.StatusCode === "201") {
                $(".dz-remove").html("");
                $('#successFailArea').html(config.messages.submit.done);
                CotApp.showModal({title:'Submission Complete', body: config.messages.submit.done, originatingElement:$("#printbtn")});
              }
              else {
                $('#successFailArea').html(config.messages.submit.fail);
                CotApp.showModal({title:'Submission Failed', body: config.messages.submit.fail, originatingElement:$("#savebtn")});
                $(".dz-hidden-input").prop("disabled", false);
                $(":input").prop("disabled", false);
                $("#printbtn").prop('disabled', false);
              }
            },
            error: function () {
              $('#successFailArea').html(config.messages.submit.fail);
              CotApp.showModal({title:'Submission Failed', body: config.messages.submit.fail, originatingElement:$("#savebtn")});
              $(".dz-hidden-input").prop("disabled", false);
              $(":input").prop("disabled", false);
              $("#printbtn").prop('disabled', false);
            }
          });

        },
        useBinding: true,
        sections: [
          {
            id:"intro",
            title:"Important Program Updates",
            className: "panel-info",
            rows: [
              {
                fields: [
                  {
                    "id":"into_updates",
                    "type":"html",
                    "html":config.into
                  }
                ]
              }
              ]
          },
          {
            id: "PropertyInformationSec",
            title: "Property Information",
            className: "panel-info",
            rows: [
              {
                fields: [
                  {
                    id: "PropertyOwner",
                    bindTo: "PropertyOwner",
                    type: "text",
                    title: "Property Owner",
                    required: true
                  },
                  {
                    id: "POName",
                    bindTo: "POName",
                    type: "text",
                    title: "Contact Name",
                    required: true
                  },
                  {
                    id: "POPhone",
                    bindTo: "POPhone",
                    type: "text",
                    title: "Phone",
                    required: true, validationtype: 'Phone'
                  },
                  {
                    id: "POEmail",
                    bindTo: "POEmail",
                    type: "text",
                    title: "Email",
                    required: true, validationtype: 'Email'
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "EcoRoofAddress",
                    bindTo: "EcoRoofAddress",
                    type: "text",
                    title: "Street Address where Eco-Roof is being Installed",
                    required: true,
                    className: "col-sm-6"
                  },
                  {
                    id: "EcoRoofPostalCode",
                    bindTo: "EcoRoofPostalCode",
                    type: "text",
                    title: "Postal Code",
                    required: true,
                    className: "col-sm-3"
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "POAddress",
                    bindTo: "POAddress",
                    type: "text",
                    title: "Mailing Address",
                    className: "col-sm-6",
                    required: true
                  },
                  {
                    id: "POPostalCode",
                    bindTo: "POPostalCode",
                    type: "text",
                    title: "Postal Code",
                    className: "col-sm-3",
                    required: true
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "GFA",
                    bindTo: "GFA",
                    type: "text",
                    title: "Gross Floor Area (m2)",
                    infohelp: config["tooltip_GFA"],
                    required: false
                  },
                  {
                    id: "TotalRoofArea",
                    bindTo: "TotalRoofArea",
                    type: "text",
                    title: "Total Roof Area (m2)",
                    infohelp: config["tooltip_TotalRoofArea"],
                    required: false
                  },
                  {
                    id: "BuildingType",
                    bindTo: "BuildingType",
                    type: "dropdown",
                    title: "Building Type",
                    required: true,
                    choices: config["BuildingType"]
                  },
                  {
                    id: "BuildingStatus",
                    bindTo: "BuildingStatus",
                    type: "radio",
                    title: "Building Status",
                    required: true,
                    orientation: 'horizontal',
                    choices: config["BuildingStatus"]
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "ExistingRoofType",
                    bindTo: "ExistingRoofType",
                    type: "text",
                    title: "Existing Roof Type",
                    required: false
                  },
                  {
                    id: "Slope",
                    bindTo: "Slope",
                    type: "text",
                    title: "Roof Slope",
                    required: false
                  },
                  {
                    id: "SlopeMeasureType",
                    bindTo: "SlopeMeasureType",
                    type: "radio",
                    title: "Roof Slope Units",
                    required: false,
                    orientation: 'horizontal',
                    choices: config["SlopeMeasureType"]
                  }
                ]
              }
            ]
          },

          {
            id: "ApplicationInfoSec",
            title: "Applicant Information",
            className: "panel-info",
            rows: [
              {
                fields: [
                  {
                    id: "AppContact",
                    bindTo: "AppContact",
                    type: "text",
                    title: "Contact Name",
                    className: "col-sm-6",
                    required: true,
                  },
                  {
                    id: "AppContactPhone",
                    bindTo: "AppContactPhone",
                    type: "text",
                    title: "Phone",
                    className: "col-sm-3",
                    required: true, validationtype: 'Phone'
                  },
                  {
                    id: "AppContactEmail",
                    bindTo: "AppContactEmail",
                    type: "text",
                    title: "Email",
                    className: "col-sm-3",
                    required: true, validationtype: 'Email'
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "Description",
                    bindTo: "Description",
                    type: "textarea",
                    title: "Project Description",
                    required: true,
                    className: "col-xs-10",
                    rows:6
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "HowDidYouHear",
                    bindTo: "HowDidYouHear",
                    type: "dropdown",
                    title: "How did you hear about the Program?",
                    required: true,
                    choices: config["HowDidYouHear"],
                    className: "col-xs-6"
                  },
                  {
                    id: "HowDidYouHearOther",
                    bindTo: "HowDidYouHearOther",
                    type: "text",
                    title: "Please Specify:",
                    required: true,
                    className: "col-xs-4"
                  }
                ]
              }
            ]
          },
          {
            id: "InstallerInfoSec",
            title: "Installer Information",
            className: "panel-info",
            rows: [
              {
                fields: [
                  {
                    id: "InstalledBy",
                    bindTo: "InstalledBy",
                    type: "radio",
                    title: "Installed By",
                    required: false, orientation: 'horizontal',
                    choices: config["installedBy"]
                  },
                  {
                    id: "InstallerMailAddress",
                    bindTo: "InstallerMailAddress",
                    type: "textarea",
                    title: "Installer Mailing Address",
                    required: false,
                    className: "col-xs-6",
                    rows:2
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "Installer",
                    bindTo: "Installer",
                    type: "text",
                    title: "Name of Installer",
                    required: true
                  },
                  {
                    id: "installerContact",
                    bindTo: "installerContact",
                    type: "text",
                    title: "Installer Contact Person",
                    required: true
                  },
                  {
                    id: "installerPhone",
                    bindTo: "installerPhone",
                    type: "text",
                    title: "Installer Phone",
                    required: true, validationtype: 'Phone'
                  },
                  {
                    id: "installerEmail",
                    bindTo: "installerEmail",
                    type: "text",
                    title: "Installer Email",
                    required: true, validationtype: 'Email'
                  }
                ]
              }
            ]
          },
          {
            id: "ProjectDetailsSec",
            title: "Project Details",
            className: "panel-info",
            rows: [
              {
                fields: [
                  {
                    id: "ProjectType",
                    bindTo: "ProjectType",
                    type: "radio",
                    title: "Project Type",
                    required: true, orientation: 'horizontal',
                    choices: config["ProjectType"]
                  },
                  {
                    id: "CompDate",
                    bindTo: "CompDate",
                    type: "datetimepicker",
                    title: "Estimated Project Completion Date",
                    required: true, "options": {"format": "YYYY-MM-DD"}
                  }
                ]
              },
              {
                fields:[
                {
                  id: "greenRoofAssessment",
                  bindTo: "greenRoofAssessment",
                  type: "radio",
                  title: "Structural Assessment",
                  prehelptext:config.greenRoofAssessment,
                  required: true,
                  orientation: "horizontal",
                  choices:config.greenRoofAssessmentChoices,
                  addclass: "Green"
                }
              ]},
              {fields:[
                {
                  id: "GreenCoverage",
                  bindTo: "GreenCoverage",
                  type: "text",
                  title: "% Coverage of Available Roof Space",
                  required: false,
                  addclass: "Green"
                },
                {
                  id: "greenRoofType",
                  bindTo: "greenRoofType",
                  type: "dropdown",
                  title: "Green Roof Type",
                  required: false,
                  choices: config["greenRoofType"],
                  addclass: "Green"
                }
              ]},
              {
                fields: [
                  {
                    id: "GreenRoofArea",
                    bindTo: "GreenRoofArea",
                    type: "text",
                    title: "Green Roof Area (m2)",
                    infohelp: config["tooltip_GreenRoofArea"],
                    required: false,
                    addclass: "Green"
                  },
                  {
                    id: "GreenArea",
                    bindTo: "GreenArea",
                    type: "text",
                    title: "Gross Floor Area (m2)",
                    infohelp: config["tooltip_GreenArea"],
                    required: false,
                    addclass: "Green"
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "GreenPlants",
                    bindTo: "GreenPlants",
                    type: "textarea",
                    title: "Plant Species",
                    required: false,
                    addclass: "Green"
                  },
                  {
                    id: "GreenDescription",
                    bindTo: "GreenDescription",
                    type: "textarea",
                    title: "Growing Medium Description",
                    required: false,
                    addclass: "Green"
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "GreenMaintenance",
                    bindTo: "GreenMaintenance",
                    type: "textarea",
                    title: "Maintenance Plan",
                    required: false,
                    addclass: "Green"
                  },
                  {
                    id: "GreenAgree",
                    bindTo: "GreenAgree",
                    type: "checkbox",
                    title: "Confirmation",
                    required: true,
                    choices: config["GreenAgree"],
                    addclass: "Green"
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "CoolRoofType",
                    bindTo: "CoolRoofType",
                    type: "radio",
                    title: "Cool Roof Type",
                    required: false, orientation: 'horizontal',
                    choices: config["CoolRoofType"],
                    addclass: "Cool"
                  },
                  {
                    id: "CoolRoofArea",
                    bindTo: "CoolRoofArea",
                    type: "text",
                    title: "Cool Roof Area (m2)",
                    required: false,
                    addclass: "Cool"
                  },
                  {
                    id: "CoolCoverage",
                    bindTo: "CoolCoverage",
                    type: "text",
                    title: "% Coverage of Available Roof Space",
                    required: false,
                    addclass: "Cool"
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "SRI",
                    bindTo: "SRI",
                    type: "text",
                    title: "Solar Reflectance Index (SRI)",
                    infohelp: config["tooltip_solarindex"],
                    required: false,
                    addclass: "Cool"
                  },
                  {
                    id: "InitialSolar",
                    bindid: "InitialSolar",
                    type: "text",
                    title: "Initial Solar Reflectance",
                    infohelp: config["tooltip_initialsolar"],
                    required: false,
                    addclass: "Cool"
                  },
                  {
                    id: "Emissivity",
                    bindTo: "Emissivity",
                    type: "text",
                    title: "Thermal Emittance",
                    infohelp: config["tooltip_emissivity"],
                    required: false,
                    addclass: "Cool"
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "CoolDescription",
                    bindTo: "CoolDescription",
                    type: "textarea",
                    title: "Product Description",
                    required: false,
                    addclass: "Cool"
                  },
                  {
                    id: "CoolMaintenance",
                    bindTo: "CoolMaintenance",
                    type: "textarea",
                    title: "Maintenance Plans",
                    required: false,
                    addclass: "Cool"
                  }
                ]
              },
              {
                fields: [
                  {
                    id: "CoolAgree",
                    bindTo: "CoolAgree",
                    type: "checkbox",
                    title: "Confirmation",
                    required: true,
                    choices: config["CoolAgree"],
                    addclass: "Cool"
                  }
                ]
              }
            ]
          },
          {
            id: "SupportingDocumentsSec",
            title: "Supporting Documents",
            className: "panel-info",
            rows: [
              {
                fields: [
                  {
                    id: "Attachments",
                    bindTo: "Attachments",
                    type: "checkbox",
                    title: "Supporting Documents Provided",
                    required: false, orientation: 'vertical',
                    posthelptext:config.uploadDetails,
                    choices: config["Attachments"]
                  }
                ]
              },
              {
                "fields": [
                  {
                    "id": "uploadedFiles",
                    "bindTo": "uploadedFiles",
                    "title": "File Attachments",
                    "type": "dropzone",
                    "options": {
                      "url": config.httpHost.app_public['/* @echo ENV*/'] + config.api.api_public.upload + config.default_repo + "/" + config.default_repo,
                      "maxFiles":5,
                      "maxFilesize":15

                    }
                  }
                ]
              },
            ]
          },
          {
            id: "MPHIPPASec",
            title: "",
            className: "panel-info",
            rows: [
              {
                fields: [
                  {"id": "cdText5", "title": "", "type": "html", "html": config['MPHIPPA']}
                ]
              }
            ]
          },
          {
            id: "secActions",
            rows: [
              {
                fields: [
                  {
                    id: "actionBar",
                    type: "html",
                    html: `<div className="col-xs-12 col-md-12">
                    <button class="btn btn-success" id="savebtn"><span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span> ` + config.button.submit + `</button>
                    <button class="btn btn-success" id="printbtn"><span class="glyphicon glyphicon-print" aria-hidden="true"></span>&nbsp;Print</button>
                    <button class="btn btn-success" id="termsbtn"><span class="glyphicon glyphicon-arrow-left" aria-hidden="true"></span>&nbsp;Terms of Use Agreement</button>
                  </div>`
                  },
                  {
                    id: "successFailRow",
                    type: "html",
                    className: "col-xs-12 col-md-12",
                    html: `<div id="successFailArea" className="col-xs-12 col-md-12"></div>`
                  }
                ]
              },
              {
                fields: [
                  {
                    "id": "SubmissionStatus",
                    "type": "html",
                    "html": "<input type=\"hidden\" bindTo=\"vAppStatus\", name=\"vAppStatus\" value=\"New\" />",
                    "class": "hidden"
                  }
                ]
              }
            ]
          }
        ]
      };
    }
  });

  // @if ENV='local' || ENV='dev'
  console.log('running on env: ', '/* @echo ENV*/');
  // @endif

  ECOModel = new CotModel({
    "PropertyOwner": "",
    "POName": "",
    "POPhone": "",
    "POEmail": "",
    "EcoRoofAddress": "",
    "EcoRoofPostalCode": "",
    "POAddress": "",
    "POPostalCode": "",
    "GFA": "",
    "TotalRoofArea": "",
    "BuildingType": "",
    "BuildingStatus": "",
    "ExistingRoofType": "",
    "Slope": "",
    "SlopeMeasureType": "",
    "AppContact": "",
    "AppContactPhone": "",
    "AppContactEmail": "",
    "Description": "",
    "InstalledBy": "",
    "InstallerMailAddress": "",
    "Installer": "",
    "installerContact": "",
    "installerPhone": "",
    "installerEmail": "",
    "ProjectType": "",
    "CompDate": "",
    "GreenCoverage": "",
    "GreenRoofArea": "",
    "GreenArea": "",
    "greenRoofType": "",
    "greenRoofAssessment":"",
    "GreenPlants": "",
    "GreenDescription": "",
    "GreenMaintenance": "",
    "GreenAgree": [""],
    "CoolRoofType": "",
    "CoolRoofArea": "",
    "CoolCoverage": "",
    "SRI": "",
    "InitialSolar": "",
    "Emissivity": "",
    "CoolDescription": "",
    "CoolMaintenance": "",
    "CoolAgree": [""],
    "Attachments": [""],
    "RefNo": "",
    "Year": "",
    "ERArea": "",
    "VerifiedArea": "",
    "GrantAmount": "",
    "PymtIssued": "",
    "totalProjectCost": "",
    "AppStatus": "",
    "ProjectStatus": "",
    "EmpDistrict": "",
    "Ward": "",
    "Maintenance": "",
    "NameForCertificate": "",
    "ConfirmedBy": "",
    "CertificateMade": "",
    "GroundFloor": "",
    "Coverage": "",
    "Notes": "",
    "staffCompDate": "",
    "SiteInspectionDate": "",
    "PayReqDate": "",
    "dtePayment": "",
    "CreatedDate": "",
    "app_uploadedFiles": []
  });

  form = new ECOForm({
    id: 'eco_form',
    title: 'Eco-Roof Rebate Application',
    model: ECOModel
  });

  function init() {
    $("#form_view").show();
    if(form._form){

    }
    else{

    form.render($('#form_view'));
      $("#HowDidYouHearOtherElement").hide();
      $("#POAddressElement .control-label").after(config.sameAsRoofAddress);
      $("#AppContactElement .control-label").after(config.sameAsPropertyContact);
      //$("#ApplicationInfoSec .panel-heading").after(config.sameAsPropertyContact);
    $("#form_view").off("click", "#printbtn").on("click", "#printbtn", function(e){
      e.preventDefault();
      window.print();
    });
    $("#form_view").off("click", "#termsbtn").on("click", "#termsbtn", function(e){
      e.preventDefault();
      showTerms();
    });

    $("#uploadedFilesElement label").after("<div class='upload_status'><span id=\"dynamic\" class=\"progress-bar progress-bar-success progress-bar-striped active\" role=\"progressbar\" aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 0%\"><span id=\"current-progress\"></span></span></div>");
    let form_id = form._form.cotForm.id;
    window.uploadcounter = 0;
    window.totaluploadcounter = 0;
    window.uploadtotalprogress = 0;

    $(".Cool, .Green").hide();
    //if (data && data.ProjectType && data.ProjectType != "") {$("." + data.ProjectType).show(); }
    $("#form_view").off('change', "input[name=ProjectType]:radio").on('change', "input[name=ProjectType]:radio", function () {
      if ($(this).val() == "Green") {
        $(".Green").show();
        $(".Cool").hide();
      } else {
        $(".Cool").show();
        $(".Green").hide();
      }
    });


    $("input[name=InstalledBy]:radio").change(function () {
      if (this.value == "Property owner/tenant") {
        $('#Installer').val($('#PropertyOwner').val()).change();
        $('#installerContact').val($('#POName').val()).change();
        $('#installerPhone').val($('#POPhone').val()).change();
        $('#installerEmail').val($('#POEmail').val()).change();
      } else {
        $('#Installer').val('').change();
        $('#installerContact').val('').change();
        $('#installerPhone').val('').change();
        $('#installerEmail').val('').change();
      }
      $("#" + form_id)
        .formValidation('revalidateField', 'Installer')
        .formValidation('revalidateField', 'installerContact')
        .formValidation('revalidateField', 'installerPhone')
        .formValidation('revalidateField', 'installerEmail');
    });
    $("#form_view").off("change", "#SameContact_0").on("change", "#SameContact_0", function () {
      if ($(this).prop('checked')) {
        $("#AppContact").val($("#POName").val()).change().prop('readonly', true);
        $("#AppContactPhone").val($("#POPhone").val()).change().prop('readonly', true);
        $("#AppContactEmail").val($("#POEmail").val()).change().prop('readonly', true);
      } else {
        $("#AppContact").val("").change().prop('readonly', false);
        $("#AppContactPhone").val("").change().prop('readonly', false);
        $("#AppContactEmail").val("").change().prop('readonly', false);
      }


      $("#" + form_id).formValidation('revalidateField', 'AppContactPhone');
      $("#" + form_id).formValidation('revalidateField', 'AppContactEmail');
      $("#" + form_id).formValidation('revalidateField', 'AppContact');
    });
    $("#form_view").off("change", "#SameAddress_0").on("change", "#SameAddress_0", function () {
      if ($(this).prop('checked')) {
        $("#POAddress").val($("#EcoRoofAddress").val()).change().prop('readonly', true);
        $("#POPostalCode").val($("#EcoRoofPostalCode").val()).change().prop('readonly', true);

      } else {
        $("#POAddress").val("").change().prop('readonly', false);
        $("#POPostalCode").val("").change().prop('readonly', false);
      }
      $("#" + form_id)
        .formValidation('revalidateField', 'POAddress')
        .formValidation('revalidateField', 'POPostalCode')
        .formValidation('revalidateField', 'EcoRoofAddress')
        .formValidation('revalidateField', 'EcoRoofPostalCode');
    });
    $("#form_view").off("change", "#HowDidYouHear").on("change", "#HowDidYouHear", function () {
      let other = $("#HowDidYouHearOtherElement");
      switch ($(this).val()) {
        case "Magazine publication":
          other.show();
          break;
        case "Event":
          other.show();
          break;
        case "Other":
          other.show();
          break;
        default:
          other.hide();
          break;
      }
    });
    $('#uploadedFiles').get(0).cotDropzone.dropzone
      .on("sending", function () {
      // Disable the submit button
      window.uploadcounter++;
      window.totaluploadcounter++;
      $(":submit").prop("disabled", true);
    })
      .on("queuecomplete", function ( ) {
      // Re-enable the submit button
        $('#dynamic')
          .css("width", "0%")
          .attr("aria-valuenow", "0")
          .text("");
        window.uploadcounter = 0;
        window.totaluploadcounter = 0;
        window.uploadtotalprogress = 0;
      $(":submit").prop("disabled", false);

    })
      .on("reset", function ( ) {$(":submit").prop("disabled", false); })
      .on("totaluploadprogress", function (a){
        let progress = a/2;
        if(a<100){
        window.uploadtotalprogress = progress;
        $('#dynamic')
          .css("width", window.uploadtotalprogress.toFixed(0)+"%")
          .attr("aria-valuenow", window.uploadtotalprogress.toFixed(0))
          .text(window.uploadtotalprogress.toFixed(0)+"% Uploading");
        }
        //console.log('totaluploadprogress',progress);
      })
      .on("complete", function (){
        window.uploadcounter--;
        let temp =  window.uploadcounter ===0?50:(((window.totaluploadcounter - window.uploadcounter)/window.totaluploadcounter*100)/2);
        let progress =  window.uploadtotalprogress + temp;
        $('#dynamic')
          .css("width", progress.toFixed(0)+"%")
          .attr("aria-valuenow", progress.toFixed(0))
          .text(progress.toFixed(0) + "% Processing");
  });
    }
}
  function showTerms(){
    $("#form_view").hide();
    $("html, body").animate({scrollTop: 0}, 'fast');
    $.removeCookie(encodeURIComponent(config.default_repo + '_terms_cookie'));
    CotApp.showTerms({
      termsText: config.terms,
      disagreedText: config.terms_decline,
      containerSelector: '#terms_view',
      agreedCookieName: config.default_repo + '_terms_cookie',
      onAgreed: function () {
        $("html, body").animate({scrollTop: 0}, 'fast');
        init();
      },
      onDisagreed: function () {
      },
      agreementTitle: 'Terms of Use Agreement'
    });
  }
});

