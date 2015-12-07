/*!
 * Chart.Guage.js
 * Version: 1.0.2
 *
 * Copyright 2015 Scott Hill
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */

 (function (factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['chart.js'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		module.exports = factory(require('chart.js'));
	} else {
		// Global browser
		factory(Chart);
	}
}(function(Chart) {

	"use strict";

	var helpers = Chart.helpers;

	var defaultsConfig = {

			//Primary Line Color for Guage Arc
			guageLineColor: "rgba(0,0,0,1)",

			//Color of Goal Line on Guage Arc 
			guageGoalColor: "rgba(127,198,97,1)",

			//Stoke Weight of Guage Arc
			guageWeight: 10,

			//Change the needle color depending on needleGood data property
			//If set to false needle will be set to needlePrimary
			autoNeedle: true,

			//Primary Needle Color - Used when needleGood is true
			//or when autoNeedle is false
			needlePrimary: "rgba(127,198,97,1)", //Default Green
			needleSeconday: "rgba(226,85,82,1)", //Default Red

			//Stoke Weight of needle
			needleWeight: 3,

            //Dispay Lables
            displayLables: true,

            //Display % to Goal 
            displayPercent: true,

            //Auto Size the Guage 
            //- If false X,Y and Radius values must be provided
            //- As well responsive resizing will not work
            autoCenter: true,

	}

	Chart.Type.extend({

			name: "Guage",

			defaults: defaultsConfig,

			initialize:  function(data){
        //this.chart.ctx - The drawing context for this chart
        //this.chart.canvas - the canvas node for this chart
        this.data = data;

        //Const Properites
    		this.min = data.min;
    		this.max = data.max;
    		this.goal = data.goal;
    		this.value = 0;

            if(this.options.autoCenter)
            {
                this.setLocation();
            }

    		this.radius = this.present(data.radius) && !this.options.autoCenter ? data.radius : this.radius;
    		this.origin_X = this.present(data.x) && !this.options.autoCenter ? data.x : this.origin_X;
    		this.origin_Y = this.present(data.y) && !this.options.autoCenter ? data.y : this.origin_Y;

    		this.guageWeight = this.options.guageWeight;
    		this.LineColor = this.options.guageLineColor;
    		this.GoalColor = this.options.guageGoalColor;
    		this.needlePrimary = this.options.needlePrimary;
    		this.needleSeconday = this.options.needleSeconday;
    		this.needleWeight = this.options.needleWeight;

    		//Optional
    		this.needleGood = (this.options.autoNeedle) ? data.needleGood : true; 

    		this.setValues();
    		//this.render();

    		this.update(data);

    	},

    	setValues: function()
    	{
		  		//Variables
		  		this.needlePersentage = (this.value > this.max) ? 1 : (this.value < this.min) ? 0 : (this.value - this.min) / (this.max - this.min);
		  		this.needleAngle = (this.needlePersentage * 180); 
		  		this.needleGap = (2 * (this.needleWeight+2) * 360) / ( 2 * Math.PI * this.radius);
		  		this.gapStart = 180 + (this.needleAngle - this.needleGap / 2);
		  		this.gapEnd = 180 + (this.needleAngle + this.needleGap / 2);
		  		this.goalPersentage = (this.goal - this.min) / (this.max - this.min);
		  		this.goalAngle = (this.goalPersentage * 180) + 180;
    	},

        present: function(value)
        {
            return typeof(value) != "undefined";
        },

    	toRad: function(DEG)
  		{
  			return (Math.PI / 180) * DEG;
  		},

        setLocation: function()
        {
            this.origin_X = this.chart.width / 2;
            this.radius = 3 * this.chart.height / 8;

            if(this.chart.height >= 130)
            {
                this.origin_Y = this.chart.height - 40;
            }
            else
            {
                this.origin_Y = 3 * this.chart.height / 4;
            }
        },

        reflow: function()
        {

            if(this.options.autoCenter)
            {
                this.setLocation();
            }

            this.update();
        }, 

    	update: function(data)
    	{
            //Update Data Values
            if(this.present(data))
            {
                this.min = (this.present(data.min)) ? data.min : this.min;
                this.max = (this.present(data.max)) ? data.max : this.max;
                this.goal = (this.present(data.goal)) ? data.goal : this.goal;
                this.needleGood = (this.options.autoNeedle && typeof(data.needleGood) != "undefined") ? data.needleGood : true;
                this.radius = (this.present(data.radius)) ? data.radius : this.radius;
                this.origin_X = (this.present(data.x)) ? data.x : this.origin_X;
                this.origin_Y = (this.present(data.y)) ? data.y : this.origin_Y;

                //Animate New Value 
                var newValue = data.value;
            
                var animate = setInterval(function(){

                    this.draw();

                    if(newValue < this.value)
                    {
                         this.value--;
                    }
                    else
                    {
                         this.value++;
                    }

                    this.setValues();

                    if(this.value == newValue)
                    {
                         clearInterval(animate);
                    }

                }.bind(this), 1);
            }
            else
            {
                this.draw();
            }

    	},

        lables: function(ctx)
        {   
            if(this.chart.height >= 80)
            {
                //Main Number
                ctx.font = (this.chart.height >= 130) ? "26px Arial" : this.chart.height / 6 + "px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = this.LineColor;
                ctx.fillText(this.value, this.origin_X, this.origin_Y - this.radius - 15 );

                //Max & Min
                ctx.font = "12px Arial";
                ctx.fillText(this.min, this.origin_X - this.radius, this.origin_Y + 15);
                ctx.fillText(this.max, this.origin_X + this.radius, this.origin_Y + 15);
            }

            if(this.options.displayPercent && this.chart.height >= 130)
            {
                //Percent
                var percent = this.value / this.goal * 100;
                ctx.font = "18px Arial";
                ctx.fillText(percent.toFixed(1)+"%", this.origin_X, this.origin_Y + 30);
            }
            
        },

    	draw: function() {

    		this.clear();

    		var ctx = this.chart.ctx;
    		var canvas = this.chart.canvas;

    		//Draw arc
    		ctx.lineWidth = this.guageWeight;

    		//Gap in Goal or Not?
    		if(this.needleAngle+180 > (this.goalAngle + this.needleGap / 2))
    		{
    				//Draw Standard Line 
    				ctx.beginPath();
    				ctx.arc(this.origin_X, this.origin_Y, this.radius, this.toRad(180), this.toRad(this.goalAngle));
    				ctx.strokeStyle = this.LineColor;
    				ctx.stroke();

    				//Draw Goal Line to Gap
    				ctx.beginPath();
    				ctx.arc(this.origin_X, this.origin_Y, this.radius, this.toRad(this.goalAngle), this.toRad(this.gapStart));
    				ctx.strokeStyle = this.GoalColor;
    				ctx.stroke();

    				if(this.value < this.max - (0.025 * this.max))
    				{
    					//Draw Goal Line from Gap
	    				ctx.beginPath();
	    				ctx.arc(this.origin_X, this.origin_Y, this.radius, this.toRad(this.gapEnd), this.toRad(360));
	    				ctx.stroke();
    				}

    		}
    		else if(this.needleAngle+180 < (this.goalAngle - this.needleGap /2 ))
    		{
    				ctx.strokeStyle = this.LineColor;

    				if(this.value > this.min + (0.025 * this.max))
    				{
					    //Draw Standard Line to Gap
	    				ctx.beginPath();
	    				ctx.arc(this.origin_X, this.origin_Y, this.radius, this.toRad(180), this.toRad(this.gapStart));
	    				ctx.stroke();
    				}

    				//Draw Goal Line to Gap
    				ctx.beginPath();
    				ctx.arc(this.origin_X, this.origin_Y, this.radius, this.toRad(this.gapEnd), this.toRad(this.goalAngle));
    				ctx.stroke();

    				//Draw Goal Line from Gap
    				ctx.beginPath();
    				ctx.arc(this.origin_X, this.origin_Y, this.radius, this.toRad(this.goalAngle), this.toRad(360));
    				ctx.strokeStyle = this.GoalColor;
    				ctx.stroke();
    		}
    		else
    		{
    			  ctx.strokeStyle = this.LineColor;

						//Draw Standard Line to Gap
    				ctx.beginPath();
    				ctx.arc(this.origin_X, this.origin_Y, this.radius, this.toRad(180), this.toRad(this.gapStart));
    				ctx.stroke();
  				

    				//Draw Goal Line to End
    				ctx.beginPath();
    				ctx.arc(this.origin_X, this.origin_Y, this.radius, this.toRad(this.gapEnd), this.toRad(360));
    				ctx.strokeStyle = this.GoalColor;
    				ctx.stroke();

    		}

    		//Draw Needle Core
    		ctx.beginPath();
			ctx.arc(this.origin_X, this.origin_Y , 3, 0 , 2*Math.PI);
			ctx.lineWidth = this.needleWeight;
			ctx.strokeStyle = (this.needleGood) ? this.needlePrimary : this.needleSeconday;
			ctx.stroke();

			//Draw Needle
			ctx.save(); //Store to Shift Coord System 

				ctx.translate(this.origin_X, this.origin_Y);
				ctx.rotate(this.toRad(this.needleAngle + 90));
				
				ctx.beginPath();
				ctx.moveTo(0, 3);            //Move to edge of needle circle
				ctx.lineTo(0, this.radius);  //Draw Line to radius
				ctx.lineWidth = this.needleWeight;
				ctx.lineCap = 'round';
				ctx.stroke();

			ctx.restore(); //Restore Coord System

            if(this.options.displayLables)
            {
                this.lables(ctx);
            }

    	}	

	});

}));