define(["backbone", "underscore", "gettext", "js/models/validation_helpers", "js/utils/date_utils"],
    function(Backbone, _, gettext, ValidationHelpers, DateUtils) {

var CourseDetails = Backbone.Model.extend({
    defaults: {
        org : '',
        course_id: '',
        run: '',
        language: '',
        start_date: null,	// maps to 'start'
        end_date: null,		// maps to 'end'
        enrollment_start: null,
        enrollment_end: null,
        syllabus: null,
        title: "",
        subtitle: "",
        duration: "",
        description: "",
        short_description: "",
        info_text: "",
        info_label: "",
        overview: "",
        intro_video: null,
        effort: null,	// an int or null,
        license: null,
        course_image_name: '', // the filename
        course_image_asset_path: '', // the full URL (/c4x/org/course/num/asset/filename)
        banner_image_name: '',
        banner_image_asset_path: '',
        video_thumbnail_image_name: '',
        video_thumbnail_image_asset_path: '',
        pre_requisite_courses: [],
        entrance_exam_enabled : '',
        entrance_exam_minimum_score_pct: '50',
        learning_info: [],
        instructor_info: {}
    },

    validate: function(newattrs) {




//         second section
// jsonObj = [];
//    $("input[class=cor-info-label]").each(function() {
//
//         var id = $(this).id;
//         var email = $(this).val();
//
//         item = {}
//         item ["title"] = id;
//         item ["email"] = email;
//
//         jsonObj.push(item);
//        alert(jsonObj)
//        $( "#course-info-label" ).attr('value',jsonObj);
//        $( "#course-info-label" ).append(jsonObj);
//     });

// second section end
        // alert("testing")
        // Returns either nothing (no return call) so that validate works or an object of {field: errorstring} pairs
        // A bit funny in that the video key validation is asynchronous; so, it won't stop the validation.
        var errors = {};
        newattrs = DateUtils.convertDateStringsToObjects(
            newattrs, ["start_date", "end_date", "enrollment_start", "enrollment_end","info_label","info_text"]
        );

        if (newattrs.start_date === null) {
            errors.start_date = gettext("The course must have an assigned start date.");
        }

        if (newattrs.start_date && newattrs.end_date && newattrs.start_date >= newattrs.end_date) {
            // alert("abc");
            errors.end_date = gettext("The course end date must be later than the course start date.");
        }
        if (newattrs.start_date && newattrs.enrollment_start && newattrs.start_date < newattrs.enrollment_start) {
            errors.enrollment_start = gettext("The course start date must be later than the enrollment start date.");
        }
        if (newattrs.enrollment_start && newattrs.enrollment_end && newattrs.enrollment_start >= newattrs.enrollment_end) {
            errors.enrollment_end = gettext("The enrollment start date cannot be after the enrollment end date.");
        }
        if (newattrs.end_date && newattrs.enrollment_end && newattrs.end_date < newattrs.enrollment_end) {
            errors.enrollment_end = gettext("The enrollment end date cannot be after the course end date.");
        }
        if (newattrs.intro_video && newattrs.intro_video !== this.get('intro_video')) {
            if (this._videokey_illegal_chars.exec(newattrs.intro_video)) {
                errors.intro_video = gettext("Key should only contain letters, numbers, _, or -");
            }
            // TODO check if key points to a real video using google's youtube api
        }
        if(_.has(newattrs, 'entrance_exam_minimum_score_pct')){
            var range = {
                min: 1,
                max: 100
            };
            if(!ValidationHelpers.validateIntegerRange(newattrs.entrance_exam_minimum_score_pct, range)){
                errors.entrance_exam_minimum_score_pct = interpolate(gettext("Please enter an integer between %(min)s and %(max)s."), range, true);
            }
        }

                // new block
for(var i = 1; i < 30; i++) {
    // alert("calling");
    if ($('#course-info-label'+i).val() && !$('#course-info-text'+i).val()) {
        // alert("call1");
        // do something f it's empty
        errors.info_label = gettext("Please Enter Information Text");
    } else if (!$('#course-info-label'+i).val() && $('#course-info-text'+i).val()) {
        // alert("call2");
        // do something else if it's not empty
        errors.info_label = gettext("Please Enter Information Label");
    }
    // else{
    //     $( ".error-span" ).text("");
    // }
}
// alert("#course-info-label"+i)

    // if($("#course-info-label" + i).length == 0) {
    //     alert("i m in")
    //         var info_label = document.getElementById('course-info-label'+i+'').value;
    // var info_text = document.getElementById('course-info-text'+i+'').value;
    // var info_label_div = document.getElementById('course-info-label'+i+'');
    // var info_text_div = document.getElementById('course-info-text'+i+'');
    // }
        var info_label = document.getElementById('course-info-label0').value;
        var info_text = document.getElementById('course-info-text').value;
        var info_label_div = document.getElementById('course-info-label0');
        var info_text_div = document.getElementById('course-info-text');
    if (info_label == "" && info_text != "") {
        // alert('Please Enter Information Label');
        info_label_div.style.borderColor = "#b20610";
        // alert('22');
        errors.info_label = gettext("Please Enter Information Label");
        // return false;
    }
    else {
        info_label_div.style.borderColor = "#b2b2b2";
    //     $( ".error-span" ).text("hghghfg");
    //
    }
    if (info_text == "" && info_label != "") {
        // alert('Please Enter Information Text');
        // info_text_div.style.borderColor = "red";
        errors.info_label = gettext("Please Enter Information Text.");
        // errors.info_text = gettext("Please Enter Information Text.");
        // $( ".error-span" ).text("Please Enter Information Text.");
        // return false;
    }
    // else {
    //     // info_text_div.style.borderColor = "green";
    //     $( ".error-span" ).text("");
    //
    //
    //
    // }

// }
        // end new block


        if (!_.isEmpty(errors)) return errors;
        // NOTE don't return empty errors as that will be interpreted as an error state
    },

    _videokey_illegal_chars : /[^a-zA-Z0-9_-]/g,

    set_videosource: function(newsource) {
        // newsource either is <video youtube="speed:key, *"/> or just the "speed:key, *" string
        // returns the videosource for the preview which iss the key whose speed is closest to 1
        if (_.isEmpty(newsource) && !_.isEmpty(this.get('intro_video'))) this.set({'intro_video': null}, {validate: true});
        // TODO remove all whitespace w/in string
        else {
            if (this.get('intro_video') !== newsource) this.set('intro_video', newsource, {validate: true});
        }

        return this.videosourceSample();
    },

    videosourceSample : function() {
        if (this.has('intro_video')) return "//www.youtube.com/embed/" + this.get('intro_video');
        else return "";
    },

    // Whether or not the course pacing can be toggled. If the course
    // has already started, returns false; otherwise, returns true.
    canTogglePace: function () {
        return new Date() <= new Date(this.get('start_date'));
    }
});







return CourseDetails;

}); // end define()

// add button js for info text and info label
$(document).ready(function() {

        init_multifield(20, '.input_fields_wrap', '.add_field_button', 'course-info-label','cor-info-label');
        init_multifield(20, '.input_fields_wrap', '.add_field_button', 'course-info-text','cor-info-text');


        function init_multifield(max, wrap, butt, fname_p,class_p) {
            var max_fields = max; //maximum input boxes allowed
            var wrapper = $(wrap); //Fields wrapper
            var add_button = $(butt); //Add button class
            var fname = fname_p;

            var x = 0; //initlal text box count
            $(add_button).click(function (e) { //on add input button click
                e.preventDefault();
                if (x < max_fields) { //max input box allowed
                    x++; //text box increment
                    // var cstring = '$(wrapper).append(\'<div><input type="text" name=' + fname +x+ '><a href="#" class="remove_field">Remove</a></div>\');' //add input box
                    var cstring = '$(wrapper).append(\'<div  class="field date" id="field-course-info-label'+x+'"> <label for="course-info-label'+x+'"></label><input class="'+class_p+'" id="'+fname+x+'" type="text" ></div>\');' //add input box
                    eval(cstring);
                }
            });

            // $(wrapper).on("click", ".remove_field", function (e) { //user click on remove text
            //     e.preventDefault();
            //     $(this).parent('div').remove();
            //     x--;
            // })
        }


    });
setTimeout( function(){
    // alert("val here ius")
 $("#course-info-label").hide();
    // alert($( "#course-info-label" ).val())
    var org_Val = $( "#course-info-label" ).val().split(",");
    $.map(org_Val, function(val, index) {
 return $.trim(val)
});

// console.log(org_Val[0]);
//     alert(org_Val[0])
    var id_set = 1
    var check_exist = 2
        document.getElementById('course-info-label0').value = org_Val[0];
        document.getElementById('course-info-text').value = org_Val[1];
    jQ_append(check_exist, id_set);
    function jQ_append(check_exist, id_set){
        // alert(check_exist);
        // alert(id_set);


    if (org_Val[check_exist] != null || typeof org_Val[check_exist] != 'undefined' || org_Val[check_exist] != 'undefined' && org_Val[check_exist]){
        // alert(org_Val[check_exist]);

        $(".input_fields_wrap").append("<div class='field date' id='field-course-info-label"+id_set+"'> <label for='course-info-label"+id_set+"'></label><input class='cor-info-label' id='course-info-label"+id_set+"' type='text' value='"+org_Val[check_exist]+"' ></div>");
        check_exist++;
        // alert(org_Val[check_exist]);
        $(".input_fields_wrap").append("<div class='field date' id='field-course-info-label"+id_set+"'> <label for='course-info-label"+id_set+"'></label><input class='cor-info-text' id='course-info-text"+id_set+"' type='text' value='"+org_Val[check_exist]+"' ></div>");
        id_set++;
        check_exist++

        jQ_append(check_exist, id_set);

        //     // '$(".input_fields_wrap").append(\'<div class="field date" id="field-course-info-label'+id_set+'"> <label for="course-info-label'+id_set+'"></label><input class="cor-info-text" id="course-info-text'+id_set+'" type="text" ></div>\');' //add input box
    //     alert("not null")
    }

        }

    $( "#course-info-label" ).attr('value',"");
  }  , 1000 );


//End  add button js for info text and info label

// $('.cor-info-label,.cor-info-text').live('keyup', function(){
    $(document).on("keyup", ".cor-info-label,.cor-info-text", function(){

        // first section
        var valueArray = []
            // alert("change is called")
        item = {}

        valueArray = $('.cor-info-label,.cor-info-text').map(function() {


        item ["title"] = this.id;
        item ["val"] = this.value;
             // alert(item ["title"]);
             // alert(item ["val"]);

    return this.value;
}).get();
    // alert(valueArray);
    var newArray = []
//     $.each(valueArray.toString().split(','), function(){
//
//   // alert(this)
//
//         if (this !== null || this !== "" || this.trim().length !== 0 ){
//             alert(this)
//             newArray.push("'"+this+"'");
//
//         }
// })
    newArray=valueArray.toString().split(/[ ,]+/).filter(function(v){return v!==''}).join(',')
    // newArray = valueArray.replace(/^(?:[\s+]|"[|-]")+/, '')
        $( "#course-info-label" ).attr('value',newArray);
        $('#course-info-label').trigger('change');

});
// first section end