export default function LaunchProteinViewExtensionPointF(pluginManager) {
    pluginManager.addToExtensionPoint('LaunchView-ProteinView', 
    // @ts-expect-error
    async ({ session, url, userProvidedTranscriptSequence, feature, connectedViewId, alignmentAlgorithm, displayName, height, showControls, showHighlight, zoomToBaseLevel, }) => {
        if (!url) {
            throw new Error('No URL provided when launching protein view');
        }
        session.addView('ProteinView', {
            type: 'ProteinView',
            alignmentAlgorithm,
            displayName,
            height,
            showControls,
            showHighlight,
            zoomToBaseLevel,
            structures: [
                {
                    url,
                    userProvidedTranscriptSequence: userProvidedTranscriptSequence ?? '',
                    feature,
                    connectedViewId,
                },
            ],
        });
    });
}
//# sourceMappingURL=index.js.map