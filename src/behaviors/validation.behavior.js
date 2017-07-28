if (!window.ValidationBehavior) {
  window.ValidationBehavior = {
    descriptionsIncludeLink: function(descriptions) {
      return !!descriptions.find(
        function(description) {
          return this.containsHttpOrMailto(description);
        }.bind(this)
      );
    },

    descriptionsIncludeTwoHashtags: function(descriptions) {
      const withHashtags = descriptions.filter(
        function(description) {
          const scrubbed = this.scrubDescription(description);
          return this.containsHashtag(scrubbed);
        }.bind(this)
      );
      return withHashtags.length >= 2;
    },

    scrubDescription: function(description) {
      const containsHttpOrMailto = this.containsHttpOrMailto(description);
      const containsHashtag = this.containsHashtag(description);
      const parts = description.split(' ');
      let result = description;
      if (containsHttpOrMailto && containsHashtag) {
        let goodParts = parts.filter(part => !this.containsHashtag(part));
        result = goodParts.join(' ');
      } else if (containsHashtag) {
        result = parts.find(part => this.containsHashtag(part));
      }

      return result;
    },

    containsHttpOrMailto: function(description) {
      return !!description.match(/(http(s?):\/\/|mailto:)/);
    },

    containsHashtag: function(description) {
      return description.match(/#\w/);
    },
  };
}
