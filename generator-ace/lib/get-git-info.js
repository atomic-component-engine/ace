/**
 * @file Provides a function to parse gitconfig and return various user info
 */

var GetGitInfo = {

    /**
     * @public
     * Parses given git config file to get various user data
     * @param {String} filename
     * @returns {Object} user data keyed by config key name
     */
    parseConfig: function(file){

        var regex = {
          section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
          param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
          comment: /^\s*;.*$/
        };


        var value = {};
        var lines = file.split(/\r\n|\r|\n/);
        var section = null;
        lines.forEach(function(line){
          if(regex.comment.test(line)){
            return;
          }else if(regex.param.test(line)){
            var match = line.match(regex.param);
            if(section){
              value[section][match[1]] = match[2];
            }else{
              value[match[1]] = match[2];
            }
          }else if(regex.section.test(line)){
            var match = line.match(regex.section);
            value[match[1]] = {};
            section = match[1];
          }else if(line.length == 0 && section){
            section = null;
          };
        });

        return value;
    },

    getConfig: function () {
      var home_dir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
      var config_file = home_dir+'/.gitconfig';
      var gitConfigStr = fs.readFileSync(config_file).toString();
      return GetGitInfo.parseConfig(gitConfigStr);
    }
};

module.exports = GetGitInfo;