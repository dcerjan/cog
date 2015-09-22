module.exports = function(grunt) {
  "use strict";
  
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks("grunt-babel");
  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks("grunt-shell");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-sass");
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.initConfig({

    eslint: {
      source: ["src/**/*.js"]
    },

    watch: {
      options: { 
        livereload: true 
      },
      
      source: { 
        files: [ "./src/**/*.js" ], 
        tasks: [ "eslint:source", "shell:mocha", "babel" ] 
      },

      sass: { 
        files: [ "./sass/**/*.scss" ], 
        tasks: [ "sass:compile" ]
      }
    },

    sass: {
      options: {
          style: "nested"
      },  
      compile: {
        files: { "./dist/style.css": "./sass/style.scss" }
      }
    },

    babel: {
      options: { 
        sourceMap:  "inline",
        modules:    "amd"
      },
      dist: {
        files: [{
          expand: true,
          cwd: "src",
          src: ["**/*.js"],
          dest: "dist",
          ext: ".js"
        }]
      }
    },

    shell: {
      mocha: {
        command: "mocha --compilers js:mocha-babel --harmony --recursive ./test",
        options: { stdout: true }
      },
      nginx: {
        command: "mkdir -p ./tmp/nginx/logs;  nginx -p ./tmp/nginx -c ../../config/nginx.conf",
        options: { stdout: true }
      }
    },

    concurrent: {
      start: { 
        tasks: ["watch", "shell:nginx"],
        options: { logConcurrentOutput: true }
      }
    },

    requirejs: {
      options: {
        baseUrl: "./",
        paths: {
          almond:           "node_modules/almond/almond",
          React:            "node_modules/react/dist/react.min",
          "config.local":   "config/config.local"
        },
        packages: [
          { name: "Cog", location: "./dev" }
        ]
      },
      lib: {
        options: {
          include: ["almond", "React"],
          out: "./bin/lib.js",
          optimize: "none",
          preserveLicenseComments: true
        }
      },
      app: {
        options: {
          include: ["Cog"],
          insertRequire: ["Cog"],
          out: "./bin/app.js",
          optimize: "uglify2",
          preserveLicenseComments: false
        }
      },
    }
  });
  
  grunt.registerTask("test", ["shell:mocha"]);
  grunt.registerTask("start", ["babel", "concurrent"]);
};
