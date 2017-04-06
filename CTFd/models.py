class DiscoveryList(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        chal = db.Column(db.Integer, db.ForeignKey('challenges.id'))
        discovery = db.Column(db.String(80))

        def __init__(self, chal, discovery):
            self.chal = chal
            self.discovery = discovery

        def __repr__(self):
            return "{0}".format(self.chal)