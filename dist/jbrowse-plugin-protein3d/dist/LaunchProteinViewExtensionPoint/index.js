export default function LaunchProteinViewExtensionPointF(pluginManager) {
    pluginManager.addToExtensionPoint('LaunchView-ProteinView', 
    // LaunchView extension points are typed as transformers `(extendee, props)
    // => extendee`, but in practice JBrowse invokes them as side-effect
    // handlers and ignores the return value. Casting away the signature
    // mismatch rather than fabricating a fake return.
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